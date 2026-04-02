// tạo 1 interface để định nghĩa kiểu dữ liệu cho Department, giúp chúng ta làm việc với dữ liệu dễ dàng hơn
// 1. Cái khung cơ bản nhất
export interface IDepartmentBase {
  id: string;
  name: string;
}
// 2. Dùng cho danh sách các phòng ban ( có thêm trạng thái hoạt động), Dùng kế thừa từ Cái khung cơ bản nhất
export interface IDepartmentList extends IDepartmentBase {
  isActive: boolean;
}

// 3. Dùng cho chi tiết phòng ban ( có thêm mô tả và danh sách nhân viên), Dùng kế thừa từ Cái khung cơ bản nhất
export interface IDepartmentDetail extends IDepartmentBase {
  description: string;
  employees: any[]; // Tạm thời để any, sau này sẽ định nghĩa kiểu cho Employee
}
