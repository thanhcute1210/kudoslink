/**
 * Script tiện ích: tạo tài khoản auth cho danh sách email
 * Chạy: node scripts/create-users.js
 * Yêu cầu: đặt SUPABASE_SERVICE_KEY trong biến môi trường hoặc .env.local
 */
const https = require('https')

const emails = [
  'huan.nguyenp@onevalue.jp','dung.nguyent2@onevalue.jp','dung.nguyent@onevalue.jp',
  'hong.phi@onevalue.jp','nga.nguyent@onevalue.jp','minh.nghiemh@onevalue.jp',
  'huy.trand@onevalue.jp','hang.caot@onevalue.jp','huy.nguyenq@onevalue.jp',
  'ha.cav@onevalue.jp','anh.nguyent@onevalue.jp','tan.don@onevalue.jp',
  'quyen.phantl@onevalue.jp','thuy.caotn@onevalue.jp','phuong.daok@onevalue.jp',
  'truong.nguyenx@onevalue.jp','uyen.nguyentt@onevalue.jp','hieu.buit@onevalue.jp',
  'trang.nguyenth@onevalue.jp','yen.tranth@onevalue.jp','hang.buitt@onevalue.jp',
  'phat.tranh@onevalue.jp','hoa.phamtn@onevalue.jp','anh.trantl@onevalue.jp',
  'thanh.leh@onevalue.jp','hoang.nguyenq@onevalue.jp','bao.builg@onevalue.jp',
  'chien.chud@onevalue.jp','hung.phamt@onevalue.jp','chi.trantq@onevalue.jp',
  'uyen.hoangp@onevalue.jp','anh.dot@onevalue.jp','duc.tranm@onevalue.jp',
]

// Lấy service key từ biến môi trường (KHÔNG hardcode vào đây)
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
if (!SERVICE_KEY) {
  console.error('Thiếu SUPABASE_SERVICE_KEY. Chạy: SUPABASE_SERVICE_KEY=xxx node scripts/create-users.js')
  process.exit(1)
}

function createUser(email) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ email, password: 'Onevalue@2026', email_confirm: true })
    const options = {
      hostname: 'sawplfsfexqrndhzmvdg.supabase.co',
      path: '/auth/v1/admin/users',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'apikey': SERVICE_KEY,
        'Authorization': 'Bearer ' + SERVICE_KEY,
      },
    }
    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          console.log(json.id ? `OK: ${email}` : `ERR: ${email} — ${json.message || json.error || ''}`)
        } catch { console.log('PARSE ERR:', email) }
        resolve()
      })
    })
    req.on('error', (e) => { console.log('FAIL:', email, e.message); resolve() })
    req.write(body)
    req.end()
  })
}

async function run() {
  for (const email of emails) await createUser(email)
  console.log('Done!')
}

run()
