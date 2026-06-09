from flask import Flask, render_template, request, jsonify
from datetime import datetime

app = Flask(__name__)

# Dữ liệu giả lập lưu lịch hẹn
appointments = []

# Xử lý logic Chatbot đơn giản
def get_chatbot_response(message):
    message = message.lower()
    if "khám" in message or "lịch" in message:
        return "Để đặt lịch khám, bạn vui lòng điền thông tin vào form 'Đặt lịch khám bệnh' ở phía trên nhé."
    elif "vneid" in message:
        return "Đây là hệ thống tích hợp tiện ích sức khỏe công dân dựa trên giao diện VNeID."
    elif "xin chào" in message or "hi" in message:
        return "Xin chào! Tôi có thể giúp gì cho bạn về việc đặt lịch khám hôm nay?"
    else:
        return "Cảm ơn bạn đã nhắn tin. Tôi có thể giúp bạn giải đáp các thắc mắc về đặt lịch khám và dịch vụ y tế."

@app.route('/')
def index():
    return render_template('index.html', appointments=appointments)

@app.route('/book', methods=['POST'])
def book_appointment():
    name = request.form.get('name')
    id_card = request.form.get('id_card')
    date = request.form.get('date')
    department = request.form.get('department')
    
    if name and id_card and date:
        appointment = {
            "name": name,
            "id_card": id_card,
            "date": date,
            "department": department,
            "time": datetime.now().strftime("%H:%M:%S")
        }
        appointments.append(appointment)
    return render_template('index.html', appointments=appointments, success=True)

@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json.get('message', '')
    bot_response = get_chatbot_response(user_message)
    return jsonify({"response": bot_response})

if __name__ == '__main__':
    app.run(debug=True, port=5000)