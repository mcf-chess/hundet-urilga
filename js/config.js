/* Edit invitation content here. Times use Ulaanbaatar (UTC+08:00). */
const CONFIG = Object.freeze({
  eyebrow: 'ХҮНДЭТГЭЛИЙН УРИЛГА',
  dedication: 'Нэрт сурган хүмүүжүүлэгч, хөгжмийн зохиолч, Хөгжим бүжгийн дунд сургуулийн Модон үлээвэр хөгжмийн анхны Монгол багш, СТА, Дэд мастер Л.\u00a0Чогдовын дурсгалд зориулсан шатрын нөхөрсөг тэмцээнд',
  welcome: 'эрхэм таныг хүрэлцэн ирэхийг хүндэтгэн урьж байна.',
  date: '2026.11.26 | Пүрэв гараг | 09:30 цагт',
  categories: [
    { id: 'rapid', name: 'Рапид', english: 'Rapid Chess', subtitle: 'Түргэвчилсэн тоглолт', icon: 'piece-knight' },
    { id: 'blitz', name: 'Блиц', english: 'Blitz Chess', subtitle: 'Түргэн тоглолт', icon: 'piece-queen' },
    { id: 'solving', name: 'Бодлого бодолт', english: 'Chess Problem Solving', subtitle: 'Шатрын бодлого, композици', icon: 'piece-king' }
  ],
  venue: 'Дүүрэн төв · 4 давхар',
  organizer: 'ФМ, УШ Ч.Мөнхбат',
  schedule: [
    { time: '09:30–10:00', title: 'Зочид цугларах, бүртгэл', detail: 'Кофе, цай' },
    { time: '10:00–12:40', title: 'Рапид · 1–4-р тойрог', detail: '7 тойрог · 20′+20″ · нэг тоглолт ~40 минут' },
    { time: '12:40–13:20', title: 'Завсарлага · Өдрийн хоол', detail: '40 минут' },
    { time: '13:20–15:20', title: 'Рапид · 5–7-р тойрог', detail: '' },
    { time: '15:20–16:00', title: 'Бодлого бодолт', detail: '40 минут · 2 нүүдлийн 2, 3 нүүдлийн 1 бодлого' },
    { time: '16:00–17:10', title: 'Блиц · 1–7-р тойрог', detail: '3′+2″ · нэг тоглолт ~10 минут' },
    { time: '17:10', title: 'Шагнал гардуулах, дессерт', detail: 'Дурсгалын арга хэмжээ өндөрлөнө' }
  ]
});
