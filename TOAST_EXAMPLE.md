# Toast Message Examples

## Dựa trên data mẫu bạn cung cấp:

```json
{
    "id": 61,
    "type": 2,
    "address": null,
    "network": null,
    "detail_bank_id": 10,
    "bank_account": "19033126712010",
    "rate": 26618,
    "amount_usdt": 5,
    "amount_vnd": 133090,
    "amount_vnd_real": 131093,
    "fee_percent": 0.015,
    "fee_vnd": 1996,
    "transaction_hash": null,
    "note": "USDTVND",
    "status": 1,
    "created_at": "2025-09-26T07:20:05.000000Z",
    "bank_name": "Ngân hàng TMCP Kỹ thương Việt Nam",
    "bank_address": "19033126712010"
}
```

## Kết quả Toast Message:

### Cho Buy USDT Transaction (type = 1):
```
Title: "Giao dịch thành công"
Message:
Mua USDT
Số tiền: 133.090 ₫ → 5 USDT
Tỷ giá: 26.618 | Phí: 1.996 ₫ (1.5%)
Ngân hàng: Ngân hàng TMCP Kỹ thương Việt Nam
Số tài khoản: 19033126712010
Thời gian: 26/9/2025, 14:20:05
```

### Cho Sell USDT Transaction (type = 2):
```
Title: "Giao dịch thành công"
Message:
Bán USDT
Số tiền: 5 USDT → 131.093 ₫
Tỷ giá: 26.618 | Phí: 1.996 ₫ (1.5%)
Ngân hàng: Ngân hàng TMCP Kỹ thương Việt Nam
Số tài khoản: 19033126712010
Thời gian: 26/9/2025, 14:20:05
```

## Logic phân biệt:
- **Buy USDT**: `type = 1` (VND → USDT)
- **Sell USDT**: `type = 2` (USDT → VND)
- **Generic**: Các trường hợp khác

## Các trường được hiển thị:
1. **Transaction Type**: Mua USDT / Bán USDT
2. **Amount**: Số tiền giao dịch với mũi tên chỉ hướng
3. **Exchange Rate**: Tỷ giá và phí
4. **Bank Info**: Tên ngân hàng và số tài khoản
5. **Time**: Thời gian giao dịch

## Đa ngôn ngữ:
- Tự động hiển thị theo ngôn ngữ được chọn (Tiếng Việt/English)
- Sử dụng i18n keys đã được định nghĩa trong `toast.*` và `detailHistory.*`
