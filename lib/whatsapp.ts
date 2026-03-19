import { CartItem } from './types';

const RAW_WHATSAPP_PHONE = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '5582991479637';

function sanitizeWhatsAppPhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

function formatWhatsAppPhone(phone: string): string {
  const digits = sanitizeWhatsAppPhone(phone);

  if (digits.length === 13 && digits.startsWith('55')) {
    return `+${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 9)}-${digits.slice(9)}`;
  }

  if (digits.length === 12 && digits.startsWith('55')) {
    return `+${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 8)}-${digits.slice(8)}`;
  }

  return phone;
}

const WHATSAPP_PHONE = sanitizeWhatsAppPhone(RAW_WHATSAPP_PHONE);

export function getWhatsAppPhone(): string {
  return WHATSAPP_PHONE;
}

export function getWhatsAppDisplayPhone(): string {
  return formatWhatsAppPhone(RAW_WHATSAPP_PHONE);
}

export function createWhatsAppLink(message: string): string {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

export function generateWhatsAppMessage(
  items: CartItem[],
  total: number,
  customerInfo?: {
    name?: string;
    city?: string;
    delivery?: string;
    payment?: string;
  }
): string {
  const lines: string[] = [];

  lines.push('Ola! Quero comprar os itens abaixo:');
  lines.push('');

  items.forEach((item) => {
    const itemTotal = (item.unitPrice * item.qty).toFixed(2).replace('.', ',');
    const unitPrice = item.unitPrice.toFixed(2).replace('.', ',');
    lines.push(`- ${item.qty}x ${item.name} (${item.ml}ml) - R$ ${unitPrice} = R$ ${itemTotal}`);
  });

  lines.push('');
  const totalStr = total.toFixed(2).replace('.', ',');
  lines.push(`*Total: R$ ${totalStr}*`);
  lines.push('');

  if (customerInfo?.name) {
    lines.push(`Nome: ${customerInfo.name}`);
  }

  if (customerInfo?.city) {
    lines.push(`Cidade/Bairro: ${customerInfo.city}`);
  }

  if (customerInfo?.delivery) {
    lines.push(`Entrega/Retirada: ${customerInfo.delivery}`);
  }

  if (customerInfo?.payment) {
    lines.push(`Forma de pagamento: ${customerInfo.payment}`);
  }

  if (customerInfo?.name || customerInfo?.city || customerInfo?.delivery || customerInfo?.payment) {
    lines.push('');
    lines.push('(Por favor, complete as informacoes acima)');
  }

  return lines.join('\n');
}

export function generateWhatsAppLink(
  items: CartItem[],
  total: number,
  customerInfo?: {
    name?: string;
    city?: string;
    delivery?: string;
    payment?: string;
  }
): string {
  const message = generateWhatsAppMessage(items, total, customerInfo);
  return createWhatsAppLink(message);
}
