# 🚀 RESTful API Design: Best Practices for Scalable Systems

REST API response format based on some of the best practices

Hướng dẫn này tổng hợp các nguyên tắc cốt lõi để xây dựng API trực quan, có khả năng mở rộng và dễ bảo trì.

---

## 1. Resource Naming & Hierarchy

### Nguyên tắc cơ bản
* **Sử dụng Danh từ:** Tuyệt đối không dùng động từ trong URL. Hành động được xác định bởi phương thức HTTP.
* **Số nhiều (Pluralization):** Sử dụng `/users` thay vì `/user`.
* **Case Style:** * **Kebab-case** cho tài nguyên: `/user-profiles`.
    * **snake_case** cho tham số truy vấn: `?sort_by=created_at`.

### Cấu trúc URL
| Mục đích | Cấu trúc URL | Phương thức |
| :--- | :--- | :--- |
| Danh sách tài nguyên | `/users` | `GET` |
| Tài nguyên cụ thể | `/users/{id}` | `GET` |
| Tài nguyên con (Quan hệ) | `/users/{id}/orders` | `GET` |
| Lọc tài nguyên | `/orders?user_id={id}` | `GET` |

---

## 2. HTTP Methods & Status Codes

### Phương thức (Verbs)
* `GET`: Truy xuất dữ liệu (Idempotent, Cacheable).
* `POST`: Tạo mới tài nguyên.
* `PUT`: Thay thế toàn bộ tài nguyên (Idempotent).
* `PATCH`: Cập nhật một phần tài nguyên.
* `DELETE`: Xóa tài nguyên.

### Mã trạng thái phổ biến (Status Codes)
| Code | Ý nghĩa | Ngữ cảnh |
| :--- | :--- | :--- |
| **200** | OK | Thành công cho GET/PUT/PATCH. |
| **201** | Created | Thành công cho POST. |
| **204** | No Content | Thành công cho DELETE (không trả về body). |
| **400** | Bad Request | Dữ liệu đầu vào không hợp lệ. |
| **401** | Unauthorized | Chưa xác thực hoặc Token hết hạn. |
| **403** | Forbidden | Đã xác thực nhưng không có quyền truy cập. |
| **404** | Not Found | Không tìm thấy tài nguyên. |
| **422** | Unprocessable Entity | Lỗi Validation dữ liệu. |
| **429** | Too Many Requests | Vượt quá giới hạn Rate Limit. |
| **500** | Internal Error | Lỗi hệ thống không xác định. |

---

## 3. Request & Response Design



### Consistent Response Structure
Tất cả các phản hồi nên có một cấu trúc bao bọc (envelope) nhất định để nhất quán dữ liệu.

**Success Response (Single Object):**
```json
{
  "data": {
    "id": 123,
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "meta": {
    "request_id": "req_abc123"
  }
}
```

**Collection Response (Pagination):**
```json
{
  "data": [
    { "id": 1, "name": "Product A" },
    { "id": 2, "name": "Product B" }
  ],
  "meta": {
    "total_records": 150,
    "current_page": 1,
    "per_page": 20,
    "total_pages": 8
  },
  "links": {
    "self": "/products?page=1",
    "next": "/products?page=2",
    "last": "/products?page=8"
  }
}
```

---

## 4. Advanced Features

### Versioning
Khuyến khích sử dụng **URL Versioning** để rõ ràng và dễ cache.
* `GET /v1/users`
* `GET /v2/users`

### Filtering, Sorting & Field Selection
* **Filtering:** `GET /products?category=electronics&min_price=100`
* **Sorting:** `GET /products?sort=price:asc,created_at:desc`
* **Sparse Fieldsets:** `GET /users/123?fields=id,name,email`

### Rate Limiting
Thông báo cho client biết giới hạn qua Headers:
* `X-RateLimit-Limit`: 1000
* `X-RateLimit-Remaining`: 999
* `Retry-After`: 60 (seconds)

---

## 5. Security & Authentication

### JWT (JSON Web Token)
Sử dụng header `Authorization: Bearer <token>`.
```json
{
  "sub": "user_123",
  "email": "user@example.com",
  "roles": ["user", "admin"],
  "iat": 1704067200,
  "exp": 1704153600
}
```

### OAuth 2.0 Scopes
Định nghĩa quyền hạn chi tiết: `read:users`, `write:orders`, `delete:products`.

---

## 6. Error Handling

Một Error Response tốt phải giúp lập trình viên sửa lỗi nhanh chóng.

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ],
    "documentation_url": "https://api.example.com/docs/errors#VALIDATION_ERROR"
  },
  "meta": {
    "request_id": "req_xyz789"
  }
}
```

---

## 7. Documentation
Sử dụng tiêu chuẩn **OpenAPI (Swagger)** để mô tả API. Điều này giúp:
1.  **Tự động hóa tài liệu UI** cho phép thử nghiệm trực tiếp.
2.  **Đảm bảo tính thống nhất** giữa Backend và Frontend.
3.  **Tạo Client SDK** tự động cho nhiều ngôn ngữ.

> **Key Takeaway:** Một API tốt là một API mà lập trình viên có thể đoán được cấu trúc của nó trước khi đọc tài liệu. Hãy ưu tiên tính nhất quán (Consistency) trên toàn bộ hệ thống.

## References

[RESTful API Design: Best Practices for Building Scalable APIs](https://dev.to/sepehr/restful-api-design-best-practices-for-building-scalable-apis-5hn1)
