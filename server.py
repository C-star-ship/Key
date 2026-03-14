from flask import Flask, request, jsonify
import sqlite3
import datetime

app = Flask(__name__)
DB_NAME = "xworld_database.db"

# --- 1. TẠO DATABASE (Chạy lần đầu) ---
def init_db():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    # Bảng lưu lịch sử dùng thử Free
    c.execute('''CREATE TABLE IF NOT EXISTS free_users 
                 (device_id TEXT PRIMARY KEY, start_time TIMESTAMP)''')
    # Bảng lưu Key VIP
    c.execute('''CREATE TABLE IF NOT EXISTS vip_keys 
                 (key_code TEXT PRIMARY KEY, expiry_date TIMESTAMP, device_id TEXT)''')
    conn.commit()
    conn.close()

init_db()

# --- 2. API KIỂM TRA KEY CHÍNH THỨC ---
@app.route('/api/check', methods=['GET'])
def check_key():
    key = request.args.get('key')
    device_id = request.args.get('hwid')
    now = datetime.datetime.now()

    if not key or not device_id:
        return jsonify({"status": "error", "message": "Thiếu thông tin Key hoặc Mã máy!"})

    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()

    # XỬ LÝ KEY FREE (Nếu khách nhập chữ FREE)
    if key.upper() == "FREE":
        c.execute("SELECT start_time FROM free_users WHERE device_id=?", (device_id,))
        result = c.fetchone()
        
        if result:
            start_time = datetime.datetime.fromisoformat(result[0])
            if (now - start_time).total_seconds() > 86400: # Đã qua 24 giờ
                conn.close()
                return jsonify({"status": "error", "message": "Bạn đã hết hạn 24H dùng thử. Vui lòng mua VIP!"})
            else:
                conn.close()
                return jsonify({"status": "free", "message": "Đang dùng bản Free."})
        else:
            # Máy mới toanh -> Đăng ký dùng thử
            c.execute("INSERT INTO free_users (device_id, start_time) VALUES (?, ?)", (device_id, now.isoformat()))
            conn.commit()
            conn.close()
            return jsonify({"status": "free", "message": "Đã kích hoạt 24H dùng thử."})

    # XỬ LÝ KEY VIP
    c.execute("SELECT expiry_date, device_id FROM vip_keys WHERE key_code=?", (key,))
    vip_result = c.fetchone()
    
    if vip_result:
        expiry_date = datetime.datetime.fromisoformat(vip_result[0])
        saved_hwid = vip_result[1]
        
        # 1. Kiểm tra hạn
        if now > expiry_date:
            conn.close()
            return jsonify({"status": "error", "message": "Key VIP này đã hết hạn!"})
            
        # 2. Khóa máy (Chống share)
        if not saved_hwid:
            c.execute("UPDATE vip_keys SET device_id=? WHERE key_code=?", (device_id, key))
            conn.commit()
        elif saved_hwid != device_id:
            conn.close()
            return jsonify({"status": "error", "message": "Key này đã bị khóa vào máy khác. Cấm share Key!"})
            
        conn.close()
        return jsonify({"status": "vip", "message": "Xác thực VIP thành công!", "exp": expiry_date.strftime("%d/%m/%Y")})

    conn.close()
    return jsonify({"status": "error", "message": "Key không tồn tại!"})

# --- 3. API TẠO KEY (DÀNH CHO ADMIN) ---
# Link: /api/admin/add?pass=matkhauadmin&key=VIP-XXX&days=30
@app.route('/api/admin/add', methods=['GET'])
def add_vip_key():
    admin_pass = request.args.get('pass')
    new_key = request.args.get('key')
    days = int(request.args.get('days', 30))
    
    # BẮT BUỘC ĐỔI MẬT KHẨU NÀY THÀNH CỦA RIÊNG BẠN
    if admin_pass != "admin_xworld_999": 
        return jsonify({"status": "error", "message": "Sai mật khẩu Admin!"})
        
    expiry = datetime.datetime.now() + datetime.timedelta(days=days)
    
    try:
        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        c.execute("INSERT INTO vip_keys (key_code, expiry_date, device_id) VALUES (?, ?, ?)", 
                  (new_key, expiry.isoformat(), None))
        conn.commit()
        conn.close()
        return jsonify({"status": "success", "message": f"Đã tạo Key: {new_key} (Hạn: {days} ngày)"})
    except sqlite3.IntegrityError:
        return jsonify({"status": "error", "message": "Key này đã tồn tại trong hệ thống!"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
