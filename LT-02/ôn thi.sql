-- Câu 23
SELECT DISTINCT PC.MADA
FROM PHANCONG PC
WHERE EXISTS (
    -- Điều kiện 1: Đề án có nhân viên họ Đinh tham gia
    SELECT 1 
    FROM NHANVIEN NV
    WHERE NV.MANV = PC.MANV AND NV.HONV = 'Dinh'
)
OR EXISTS (
    -- Điều kiện 2: Đề án được chủ trì bởi Trưởng phòng họ Dinh
    SELECT 1
    FROM DEAN D
    JOIN PHONGBAN PB ON D.MAPHG = PB.MAPHG -- Kết nối đề án với phòng quản lý
    JOIN NHANVIEN TP ON PB.TRPHG = TP.MANV      -- Kết nối phòng với trưởng phòng
    WHERE D.MADA = PC.MADA                     -- Phải đúng là đề án đó
      AND TP.HONV = 'Dinh'                     -- Trưởng phòng họ Dinh
);

-- Câu 24
select HONV,TENLOT,TENNV
from NHANVIEN NV
where exists (select 1
             from THANNHAN TN
             where NV.MANV=TN.MANV
             group by TN.MANV
             having count(MANV) > 2
             )
select HONV,TENLOT,TENNV
from NHANVIEN NV
where MANV in (select TN.MANV
               from THANNHAN TN
               group by TN.MANV
               having count(TN.MANV) > 2 
               ) 

-- Câu 25
select HONV,TENLOT,TENNV
from NHANVIEN NV
where NV.MANV not in ( select TN.MANV
                   from THANNHAN TN 
                 )

select HONV,TENLOT,TENNV
from NHANVIEN NV
where not exists (select 1
                  from THANNHAN TN
                  where NV.MANV=TN.MANV
                  )

-- Câu 27
select HONV,TENLOT,TENNV
from NHANVIEN NV 
where NV.MANV in (select TRPHG
                  from PHONGBAN PB
                 )
and   NV.MANV in (select TN.MANV
                 from THANNHAN TN
                 where TN.QUANHE <> 'Vo Chong' and TN.QUANHE <> 'Con'
                 )

-- Câu 28
select HONV,TENLOT,TENNV
from NHANVIEN NV
where MLUONG > (select avg(NV2.MLUONG)
                from PHONGBAN PB,NHANVIEN NV2
                where PB.MAPHG=NV2.PHONG and TENPHG='Nghien cuu'
               )

-- Câu 29 
select HONV,TENLOT,TENNV,TENPHG
from NHANVIEN NV 
join PHONGBAN PB on NV.MANV=PB.TRPHG
where NV.MANV in (select MAX(COUNT(NV2.MANV))
                  from NHANVIEN NV2 ,PHONGBAN 
                  group by TENPHG
                  )