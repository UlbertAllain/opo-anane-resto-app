// lib/api/export.ts
import * as XLSX from 'xlsx'

export function exportOrdersToExcel(orders: any[], fileName: string = 'Laporan-Pesanan') {
  // 1. Flatten data: Karena 1 order bisa banyak item, kita pecah per baris item
  const dataToExport: any[] = [];

  orders.forEach((order) => {
    const baseData = {
      'Kode Pesanan': order?.order_code || '-',
      'Nama Customer': order?.customer_name || '-',
      'Tipe': order?.order_type === 'dine-in' ? 'Makan di Tempat' : 'Bungkus',
      'Meja': order?.table_number || '-',
      'Status': order?.status?.toUpperCase(),
      'Total Harga': order?.total_price || 0,
      'Waktu Pesan': new Date(order?.created_at).toLocaleString('id-ID')
    };

    // Jika order punya items, bikin 1 baris per item
    if (order?.order_items && order.order_items.length > 0) {
      order.order_items.forEach((item: any) => {
        dataToExport.push({
          ...baseData,
          'Menu': item?.menu_name || '-',
          'Jumlah': item?.quantity || 0,
          'Harga Satuan': item?.price || 0,
          'Level Pedas': item?.selected_spicy_level || '-',
          'Catatan Item': item?.notes || '-'
        });
      });
    } else {
      // Kalau somehow tidak ada item, tetap masukin data base-nya
      dataToExport.push(baseData);
    }
  });

  // 2. Buat Worksheet & Workbook
  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Pesanan");

  // 3. Trigger Download
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}