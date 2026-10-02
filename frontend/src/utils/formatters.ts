/**
 * Currency, date, and text formatting utilities
 */

// Format number to Vietnamese Dong (VNĐ)
export const formatCurrency = (amount: number | string | undefined | null): string => {
  if (amount === undefined || amount === null) return '0 ₫';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
};

export const formatVND = formatCurrency;

// Format compact currency (e.g., 8.5 Tr, 4.85 Tỷ)
export const formatCompactCurrency = (amount: number): string => {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(2)} Tỷ`;
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)} Tr`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)} K`;
  }
  return `${amount} ₫`;
};

// Format date string to dd/MM/yyyy
export const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return '---';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
};

// Format datetime string to dd/MM/yyyy HH:mm
export const formatDateTime = (dateString: string | undefined | null): string => {
  if (!dateString) return '---';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
};

// Mask phone number for privacy e.g. 0912.***.689
export const maskPhone = (phone: string): string => {
  if (!phone || phone.length < 7) return phone;
  return `${phone.substring(0, 4)}.***.${phone.substring(phone.length - 3)}`;
};

// Mask Citizen ID e.g. 001201******
export const maskCitizenId = (cid: string): string => {
  if (!cid || cid.length < 8) return cid;
  return `${cid.substring(0, 6)}******`;
};

// Calculate days remaining between today and a target date
export const getDaysRemaining = (targetDate: string): number => {
  const target = new Date(targetDate).getTime();
  const today = new Date().getTime();
  const diffDays = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Chuyển đổi số tiền thành chữ tiếng Việt chuẩn xác (VD: 11500000 -> Mười một triệu năm trăm nghìn đồng chẵn)
export const numberToVietnameseWords = (amount: number): string => {
  if (!amount || amount === 0) return 'Không đồng chẵn';
  const digits = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  const units = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ'];

  const readThreeDigits = (num: number, showZeroHundred: boolean): string => {
    let res = '';
    const h = Math.floor(num / 100);
    const t = Math.floor((num % 100) / 10);
    const u = num % 10;

    if (h > 0 || showZeroHundred) {
      res += `${digits[h]} trăm `;
    }
    if (t > 1) {
      res += `${digits[t]} mươi `;
      if (u === 1) res += 'mốt ';
      else if (u === 5) res += 'lăm ';
      else if (u > 0) res += `${digits[u]} `;
    } else if (t === 1) {
      res += 'mười ';
      if (u === 5) res += 'lăm ';
      else if (u > 0) res += `${digits[u]} `;
    } else if (showZeroHundred && u > 0) {
      res += `lẻ ${digits[u]} `;
    } else if (u > 0) {
      res += `${digits[u]} `;
    }
    return res.trim();
  };

  let str = '';
  let groupIndex = 0;
  let remaining = Math.abs(Math.round(amount));

  while (remaining > 0) {
    const chunk = remaining % 1000;
    if (chunk > 0) {
      const chunkStr = readThreeDigits(chunk, remaining >= 1000);
      str = `${chunkStr} ${units[groupIndex]} ${str}`.trim();
    }
    remaining = Math.floor(remaining / 1000);
    groupIndex++;
  }

  str = str.replace(/\s+/g, ' ').trim();
  if (!str) return 'Không đồng chẵn';
  const capitalized = str.charAt(0).toUpperCase() + str.slice(1);
  return `${capitalized} đồng chẵn.`;
};

/**
 * So sánh họ tên người để kiểm tra cùng một người hay khác người.
 * Loại bỏ các ghi chú trong ngoặc đơn (VD: "Nguyễn Văn An (Cập nhật SĐT)" và "Nguyễn Văn An")
 */
export const isSamePersonName = (name1?: string | null, name2?: string | null): boolean => {
  if (!name1 || !name2) return false;
  const clean1 = name1.replace(/[\(\[\{].*?[\)\]\}]/g, '').trim().toLowerCase().replace(/\s+/g, ' ');
  const clean2 = name2.replace(/[\(\[\{].*?[\)\]\}]/g, '').trim().toLowerCase().replace(/\s+/g, ' ');
  return clean1 === clean2;
};

