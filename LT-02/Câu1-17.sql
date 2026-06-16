--Câu 1 
select MANV,HONV,TENLOT,TENNV
from NHANVIEN
where PHONG='NC';

--Câu 2
select MANV,HONV,TENLOT,TENNV,PHAI,MLUONG
from NHANVIEN
where MLUONG > 3000000

--Câu 3
select HONV,TENLOT,TENNV,PHONG,MLUONG
from NHANVIEN
where MLUONG between 2000000 and 3000000;

--Câu 4
select HONV,TENLOT,TENNV,DCHI
from NHANVIEN
where DCHI like '%TP HCM%';

--Câu 5
select HONV,TENLOT,TENNV,NGSINH,DCHI
from NHANVIEN
where HONV='Dinh' and TENLOT='Ba' and TENNV='Tien';

--Câu 6
select TENTN,NGSINH
from THANNHAN TN
where TN.MANV='001' and (2026 - year(NGSINH) < 18);

--Câu 7
select HONV,TENLOT,TENNV,NGSINH
from NHANVIEN
where 2026 - year(NGSINH) > 30;

--Câu 8 
select TENPHG 'Tên phòng',DD.DIADIEM 'Địa điểm' 
from PHONGBAN PB,DDIEM_PHG DD;

--Câu 9
select HONV,TENLOT,TENNV,PHONG
from PHONGBAN PB,NHANVIEN NV
where TRPHG = MANV;

--Câu 10 
select TENDA, MADA, DDIEM_DA, TENPHG, PB.MAPHG, TRPHG, NGNC
from PHONGBAN PB, DEAN DA
where DA.MAPHG = PB.MAPHG ;

--Câu 11
select HONV,TENLOT,TENNV,DCHI,TENPHG
from NHANVIEN NV,PHONGBAN PB
where NV.PHONG=PB.MAPHG and PB.TENPHG='Nghien cuu';

--Câu 12
select HONV,TENLOT,TENNV,TN.TENTN
from NHANVIEN NV,THANNHAN TN
where NV.PHAI='Nu' and NV.MANV=TN.MANV;

--Câu 13
select NV.MANV,HONV,TENLOT,TENNV,TENPHG
from ((NHANVIEN NV join PHANCONG PC on NV.MANV=PC.MANV) 
join DEAN DA on	DA.MADA = PC.MADA) 
join PHONGBAN PB on NV.PHONG=PB.MAPHG
where TENPHG='Nghien cuu' and TENDA LIKE 'Tin hoc hoa%' and THOIGIAN = 20;

--Câu 14
select MADA,PHONG,HONV,TENNV,DCHI,NGSINH,DDIEM_DA
from DEAN DA 
join PHONGBAN PB on DA.MAPHG=PB.MAPHG 
join NHANVIEN NV on  PB.TRPHG=NV.MANV
where DDIEM_DA='HANOI';

--Câu 15
select NV.HONV + ' ' + NV.TENLOT + ' ' + NV.TENNV 'Họ tên nhân viên',
TP.HONV + ' ' + TP.TENLOT + ' ' + TP.TENNV 'Họ tên trưởng phòng'
from PHONGBAN PB
join NHANVIEN NV on PB.MAPHG=NV.PHONG
join NHANVIEN TP on TP.MANV=PB.TRPHG

select * from NHANVIEN 