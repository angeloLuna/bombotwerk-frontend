import React from 'react';
import Price from '@/components/ui/Price';
import { Mail, Calendar, ShieldCheck, Tag } from 'lucide-react';

interface EmailReceiptPreviewProps {
  order: {
    orderNumber: string;
    customerName: string | null;
    customerEmail: string | null;
    status: string;
    createdAt: string;
    subtotal: number;
    shippingTotal: number;
    total: number;
    currency: string;
    payment?: {
      status: string;
      paymentMethod: string | null;
      providerPaymentId: string | null;
    } | null;
    items: Array<{
      id: string;
      productName: string | null;
      variantName: string | null;
      quantity: number;
      unitPrice: number;
      total: number;
    }>;
  };
}


export default function EmailReceiptPreview({ order }: EmailReceiptPreviewProps) {
  // Format payment status text
  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Aprobado';
      case 'pending':
        return 'Pendiente';
      case 'failed':
        return 'Fallido';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const formattedDate = new Date(order.createdAt).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="w-full bg-[#121214] border border-white/10 rounded-2xl overflow-hidden shadow-2xl font-sans text-left">
      {/* Email Header / Window Controls */}
      <div className="bg-[#1a1a1e] px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <div className="flex gap-2">
          <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
        </div>
        <span className="text-[10px] tracking-widest font-display text-neutral-500 font-bold uppercase">
          VISTA PREVIA DEL COMPROBANTE
        </span>
        <div className="w-12" /> {/* spacer to balance */}
      </div>

      {/* Email Metadata */}
      <div className="p-4 border-b border-white/5 bg-[#141417]/50 space-y-2 text-xs text-neutral-400">
        <div>
          <span className="font-bold text-neutral-500">De: </span> 
          <span className="text-brand-magenta">bombo.twerk@atelier.cdmx</span>
        </div>
        <div>
          <span className="font-bold text-neutral-500">Para: </span> 
          <span>{order.customerName || 'Invitado'} &lt;{order.customerEmail || 'correo@ejemplo.com'}&gt;</span>
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-white/5 mt-2">
          <Mail className="w-4 h-4 text-brand-magenta" />
          <span className="font-bold text-white">Asunto: </span>
          <span className="text-neutral-200">
            Confirmación de compra Bombo Twerk — {order.orderNumber}
          </span>
        </div>
      </div>

      {/* Email Body Mockup */}
      <div className="p-6 md:p-8 bg-white text-neutral-800 space-y-6 font-sans">
        {/* Mock Logo / Branding */}
        <div className="text-center pb-4 border-b border-neutral-100">
          <h2 className="font-bebas text-3xl tracking-widest text-black">BOMBO TWERK</h2>
          <p className="text-[9px] tracking-widest font-display text-neutral-500 font-bold uppercase -mt-1">
            ATELIER // PERFORMANCEWEAR
          </p>
        </div>

        {/* Greeting */}
        <div className="space-y-2">
          <p className="text-sm font-bold text-black">Hola, {order.customerName || 'Invitado'}.</p>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Gracias por tu compra en **Bombo Twerk**. Tu pedido ha sido registrado con éxito y estamos listos para procesarlo en nuestro taller.
          </p>
        </div>

        {/* Order Details Banner */}
        <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-xl space-y-2.5 text-xs text-neutral-700">
          <div className="flex justify-between border-b border-neutral-200/60 pb-1.5">
            <span className="font-semibold text-neutral-500">Estado del pago:</span>
            <span className={`font-bold uppercase tracking-wider ${order.status === 'paid' ? 'text-green-600' : order.status === 'failed' ? 'text-red-600' : 'text-amber-600'}`}>
              {getPaymentStatusText(order.status)}
            </span>
          </div>
          <div className="flex justify-between border-b border-neutral-200/60 pb-1.5">
            <span className="font-semibold text-neutral-500">Número de orden:</span>
            <span className="font-mono font-bold text-black">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between border-b border-neutral-200/60 pb-1.5">
            <span className="font-semibold text-neutral-500">Fecha del pedido:</span>
            <span>{formattedDate}</span>
          </div>
          {order.payment?.paymentMethod && (
            <div className="flex justify-between border-b border-neutral-200/60 pb-1.5">
              <span className="font-semibold text-neutral-500">Método de pago:</span>
              <span className="uppercase font-medium text-black">{order.payment.paymentMethod}</span>
            </div>
          )}
          {order.payment?.providerPaymentId && (
            <div className="flex justify-between">
              <span className="font-semibold text-neutral-500">ID de transacción:</span>
              <span className="font-mono text-neutral-600">{order.payment.providerPaymentId}</span>
            </div>
          )}
        </div>

        {/* Products List Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-black uppercase tracking-wider border-b border-neutral-200 pb-1">
            DETALLE DEL PEDIDO
          </h3>
          <div className="divide-y divide-neutral-100 space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start text-xs pt-3 first:pt-0">
                <div className="space-y-0.5 max-w-[70%]">
                  <p className="font-bold text-neutral-900">{item.productName || 'Producto'}</p>
                  <p className="text-[10px] text-neutral-500 font-mono">VARIANTE: {(item.variantName || 'N/A').toUpperCase()}</p>
                  <p className="text-[10px] text-neutral-400">Cantidad: {item.quantity}</p>
                </div>
                <div className="text-right font-semibold text-neutral-900">
                  {item.quantity} x ${item.unitPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })} {order.currency}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals Summary */}
        <div className="border-t border-neutral-200 pt-4 space-y-2 text-xs">
          <div className="flex justify-between text-neutral-500">
            <span>Subtotal</span>
            <span>${order.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} {order.currency}</span>
          </div>
          <div className="flex justify-between text-neutral-500">
            <span>Costo de envío</span>
            {order.shippingTotal > 0 ? (
              <span>${order.shippingTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} {order.currency}</span>
            ) : (
              <span className="text-green-600 font-bold uppercase tracking-wider text-[9px] bg-green-50 px-2 py-0.5 rounded">Gratis</span>
            )}
          </div>
          <div className="flex justify-between font-bold text-base text-black border-t border-neutral-100 pt-2">
            <span>Total pagado</span>
            <span>${order.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} {order.currency}</span>
          </div>
        </div>

        {/* Footer Notes */}
        <div className="border-t border-neutral-200 pt-6 text-center space-y-3">
          <p className="text-[10px] text-neutral-400 leading-relaxed">
            Este correo es un comprobante de compra digital. Tan pronto como tu pedido sea despachado desde nuestro taller en CDMX, recibirás otro correo con la información de seguimiento.
          </p>
          <div className="flex justify-center items-center gap-1 text-[9px] font-bold text-neutral-500 tracking-wider">
            <ShieldCheck className="w-4 h-4 text-neutral-400" />
            <span>CALIDAD CDMX ATELIER GARANTIZADA</span>
          </div>
        </div>
      </div>
    </div>
  );
}
