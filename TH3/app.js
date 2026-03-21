const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));

// Dữ liệu 5 địa điểm du lịch
const locations = [
    { id: 1, name: 'Đà Lạt', description: 'Thành phố mộng mơ với khí hậu mát mẻ quanh năm', price: 1500000, hot: true, image: '/img/dalat.jpg' },
    { id: 2, name: 'Nha Trang', description: 'Thành phố biển nổi tiếng với nhiều bãi tắm đẹp', price: 1800000, hot: false, image: '/img/nhatrang.jpg' },
    { id: 3, name: 'Sa Pa', description: 'Khu du lịch vùng núi với khí hậu se lạnh', price: 2000000, hot: true, image: '/img/sapa.jpg' },
    { id: 4, name: 'Phú Quốc', description: 'Đảo du lịch nổi tiếng ở miền Nam', price: 2500000, hot: false, image: '/img/phuquoc.jpg' },
    { id: 5, name: 'Đà Nẵng', description: 'Thành phố hiện đại, sạch đẹp và đáng sống', price: 1700000, hot: true, image: '/img/danang.jpg' }
];

app.get('/', (req, res) => {
    res.render('index', { title: 'Trang chủ Du Lịch Việt' });
});

app.get('/list', (req, res) => {
    res.render('list', { title: 'Danh sách địa điểm', items: locations });
});

app.get('/contact', (req, res) => {
    res.render('contact', { title: 'Liên hệ chúng tôi' });
});

app.get('/detail/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const item = locations.find(x => x.id === id);
    if (!item) return res.send('Không tìm thấy dữ liệu');
    res.render('detail', { title: 'Chi tiết: ' + item.name, item: item });
});

app.listen(3000, () => console.log('Server chạy tại http://localhost:3000'));