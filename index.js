const express = require('express');
const axios = require('axios');
const app = express();
const cors = require('cors');
const PORT = 3000;

app.use(cors());

const API_URL_GOLD = 'https://edge-api.pnj.io/ecom-frontend/v1/get-gold-price?zone=00';
const API_URL_SILVER = 'https://giabac.vn/SilverInfo/GetGoldPriceChartFromSQLData?days=1';

app.get('/api/getPrice', async (req, res) => {
    try {
        const [goldResponse, silverResponse] = await Promise.all([
            axios.get(API_URL_GOLD),
            axios.get(API_URL_SILVER)
        ]);

        const goldData = goldResponse.data;
        const silverData = silverResponse.data;

        const lastBuyPrices = silverData.LastBuyPrices ?? [];
        const lastSellPrices = silverData.LastSellPrices ?? [];

        // Nếu mảng rỗng, .at(-1) sẽ trả về 'undefined'. Ta dùng ?? 0 để đảm bảo giá trị là số.
        const giaBanBac = (lastBuyPrices.at(-1) ?? 0) / 10;
        const giaMuaBac = (lastSellPrices.at(-1) ?? 0) / 10;
        // --- Kết thúc sửa lỗi ---

        const aggregatedData = {
            data: [
                {
                    name: "Vàng SJC",
                    giaBan: goldData.data[0].giamua * 1000,
                    giaMua: goldData.data[0].giaban * 1000,
                },
                {
                    name: "Vàng PNJ",
                    giaBan: goldData.data[1].giamua * 1000,
                    giaMua: goldData.data[1].giaban * 1000,
                },
                {
                    name: "Bạc Phú Quý",
                    // Sử dụng các biến đã được kiểm tra an toàn
                    giaBan: giaBanBac,
                    giaMua: giaMuaBac,
                }
            ]
        };

        res.status(200).json(aggregatedData);

    } catch (error) {
        console.error("Lỗi khi tổng hợp dữ liệu:", error.message);
        res.status(500).json({
            message: "Lỗi Server khi tổng hợp dữ liệu từ các API bên ngoài.",
            details: error.message
        });
    }
});


app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});