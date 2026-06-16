from transformers import AutoModel, AutoTokenizer

print("--- HỆ THỐNG: Đang đọc mô hình từ cache... ---")

# 1. Gọi mô hình từ cache đã tải lúc nãy ra
model = AutoModel.from_pretrained('vinai/phobert-base-v2')
tokenizer = AutoTokenizer.from_pretrained('vinai/phobert-base-v2')

print("--- HỆ THỐNG: Đang xuất mô hình về thư mục dự án (ổ D)... ---")

# 2. Lưu một bản sao "sạch" trực tiếp vào thư mục dự án với tên là 'phobert_v2'
model.save_pretrained('./phobert_v2')
tokenizer.save_pretrained('./phobert_v2')

print("--- HỆ THỐNG: ĐÃ ĐƯA AI VỀ THƯ MỤC DỰ ÁN THÀNH CÔNG! ---")/