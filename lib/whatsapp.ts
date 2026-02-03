import { CartItem } from './types';

const WHATSAPP_PHONE = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '5511999999999';

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
  
  lines.push('Olá! Quero comprar os itens abaixo:');
  lines.push('');

  items.forEach((item) => {
    const itemTotal = (item.unitPrice * item.qty).toFixed(2).replace('.', ',');
    const unitPrice = item.unitPrice.toFixed(2).replace('.', ',');
    lines.push(`• ${item.qty}x ${item.name} (${item.ml}ml) — R$ ${unitPrice} = R$ ${itemTotal}`);
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
    lines.push('(Por favor, complete as informações acima)');
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
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodedMessage}`;
}
