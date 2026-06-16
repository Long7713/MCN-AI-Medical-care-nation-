--Câu 23
select DEAN.MADA,TENDA,HONV + ' ' + TENLOT + ' ' + TENNV as 'HỌ TÊN'
from DEAN 
join PHANCONG on DEAN.MADA=PHANCONG.MADA 
join NHANVIEN on NHANVIEN.MANV=PHANCONG.MANV
where HONV = 'Dinh' and 
(
DEAN.MADA in (
              select MADA            
              from NHANVIEN,PHANCONG
              where HONV = 'Dinh' and PHANCONG.MANV=NHANVIEN.MANV
              ) 
or DEAN.MAPHG in (
              select  MAPHG 
              from NHANVIEN,PHONGBAN
              where HONV = 'DINH' and TRPHG=MANV
                 )
)

--Câu 24
select HONV + ' ' + TENLOT + ' ' + TENNV as 'HỌ TÊN'
from NHANVIEN 
where MANV in (
           select MANV
           from THANNHAN 
           group by MANV
           having count(MATN) > 2 
           )

--Câu 25
select HONV + ' ' + TENLOT + ' ' + TENNV as 'HỌ TÊN'
from NHANVIEN
where MANV not in (
           select MANV
           from THANNHAN
           )

--Câu 26
select HONV + ' ' + TENLOT + ' ' + TENNV as 'HỌ TÊN'
from NHANVIEN
where MANV in (
           select MANV
           from THANNHAN join PHONGBAN on MANV=TRPHG
           group by MANV
           having count(MATN) >= 1 
           )

--Câu 27
select HONV + ' ' + TENLOT + ' ' + TENNV as 'HỌ TÊN'
from NHANVIEN 
where MANV in (
           select MANV
           from THANNHAN join PHONGBAN on MANV=TRPHG
           where QUANHE <> 'Vo Chong' 
           )

--Câu 28
select HONV + ' ' + TENLOT + ' ' + TENNV as 'HỌ TÊN'
from NHANVIEN nv
where MLUONG > (
      select avg(MLUONG)
      from NHANVIEN join PHONGBAN on PHONG=MAPHG
      where TENPHG='Nghien cuu'
      )


               
--Câu 29 
select TENPHG,HONV,TENLOT,TENNV
from PHONGBAN PB join NHANVIEN NV on TRPHG=PHONG
where PB.MAPHG in (
               select NV1.PHONG
               from NHANVIEN NV1
               group by NV1.PHONG
               having count(*) >= all(
                                  select count(*)
                                  from NHANVIEN NV2
                                  group by NV2.PHONG
                                  )
)

--Câu 31
select HONV,TENLOT,TENNV,DCHI
from NHANVIEN NV
where exists ( 
             select 1
             from PHANCONG PC join DEAN DA on PC.MADA=DA.MADA
             where PC.MANV=NV.MANV and DA.DDIEM_DA not in (
                                                          select DDP.DIADIEM
                                                          from DDIEM_PHG DDP
                                                          where DDP.MAPHG=NV.PHONG 
             )                                             )


