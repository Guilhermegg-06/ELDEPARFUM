targetScope = 'resourceGroup'

@description('Obrigatório: declarar autorização expressa para recursos potencialmente faturáveis.')
@allowed([true])
param custosAutorizados bool

@minLength(3)
@maxLength(30)
param appName string
param location string = resourceGroup().location

@description('Origens HTTPS exatas do frontend, sem barra final ou wildcard.')
@minLength(1)
param allowedOrigins array

@description('URL HTTPS do projeto Supabase já existente.')
param supabaseUrl string

@secure()
param supabasePublishableKey string

@secure()
@description('UUIDs de contas de teste autorizadas, separados por vírgula.')
param adminUserIds string

@minValue(1)
@maxValue(1000)
param dailyLimit int = 100

var storageName = 'demand${uniqueString(resourceGroup().id, appName)}'
var tags = {
  project: 'eldeparfum-cloud-demand'
  purpose: 'academic'
  costAuthorized: string(custosAutorizados)
}

resource storage 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: storageName
  location: location
  tags: tags
  kind: 'StorageV2'
  sku: {
      name: 'Standard_LRS'
    }
  properties: {
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
    allowBlobPublicAccess: false
    allowSharedKeyAccess: true
  }
}
resource tables 'Microsoft.Storage/storageAccounts/tableServices@2023-05-01' = {
  parent: storage
  name: 'default'
}
resource interests 'Microsoft.Storage/storageAccounts/tableServices/tables@2023-05-01' = {
  parent: tables
  name: 'DemandInterests'
}
resource files 'Microsoft.Storage/storageAccounts/fileServices@2023-05-01' = {
  parent: storage
  name: 'default'
}
resource contentShare 'Microsoft.Storage/storageAccounts/fileServices/shares@2023-05-01' = {
  parent: files
  name: 'function-content'
  properties: {
      shareQuota: 1
    }
}
resource plan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: '${appName}-plan'
  location: location
  tags: tags
  sku: {
      name: 'Y1'
      tier: 'Dynamic'
    }
  properties: {
      reserved: false
    }
}
var storageConnection = 'DefaultEndpointsProtocol=https;AccountName=${storage.name};AccountKey=${storage.listKeys().keys[0].value};EndpointSuffix=${environment().suffixes.storage}'

resource functionApp 'Microsoft.Web/sites@2023-12-01' = {
  name: appName
  location: location
  tags: tags
  kind: 'functionapp'
  properties: {
    serverFarmId: plan.id
    httpsOnly: true
    siteConfig: {
      minTlsVersion: '1.2'
      scmMinTlsVersion: '1.2'
      ftpsState: 'Disabled'
      use32BitWorkerProcess: false
      http20Enabled: true
      cors: {
      allowedOrigins: allowedOrigins
      supportCredentials: false
    }
      appSettings: [
        {
      name: 'AzureWebJobsStorage'
      value: storageConnection
    }
        {
      name: 'WEBSITE_CONTENTAZUREFILECONNECTIONSTRING'
      value: storageConnection
    }
        {
      name: 'WEBSITE_CONTENTSHARE'
      value: contentShare.name
    }
        {
      name: 'FUNCTIONS_EXTENSION_VERSION'
      value: '~4'
    }
        {
      name: 'FUNCTIONS_WORKER_RUNTIME'
      value: 'node'
    }
        {
      name: 'WEBSITE_NODE_DEFAULT_VERSION'
      value: '~22'
    }
        {
      name: 'WEBSITE_RUN_FROM_PACKAGE'
      value: '1'
    }
        {
      name: 'FUNCTIONS_REQUEST_BODY_SIZE_LIMIT'
      value: '2048'
    }
        {
      name: 'WEBSITE_MAX_DYNAMIC_APPLICATION_SCALE_OUT'
      value: '1'
    }
        {
      name: 'DEMAND_STORAGE_CONNECTION_STRING'
      value: storageConnection
    }
        {
      name: 'DEMAND_TABLE_NAME'
      value: interests.name
    }
        {
      name: 'DEMAND_DAILY_LIMIT'
      value: string(dailyLimit)
    }
        {
      name: 'DEMAND_ENABLED'
      value: 'false'
    }
        {
      name: 'SUPABASE_URL'
      value: supabaseUrl
    }
        {
      name: 'SUPABASE_PUBLISHABLE_KEY'
      value: supabasePublishableKey
    }
        {
      name: 'DEMAND_ADMIN_USER_IDS'
      value: adminUserIds
    }
      ]
    }
  }
}
output apiBaseUrl string = 'https://${functionApp.properties.defaultHostName}'
output tableName string = interests.name
output storageAccountName string = storage.name
