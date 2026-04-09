export default function Marquee() {
  return (
    <div className="overflow-hidden bg-red-100 rounded-md">
      <div className="whitespace-nowrap animate-marquee py-2 text-red-600 text-sm font-medium">
        🔥 Sale 50% toàn bộ sản phẩm &nbsp;&nbsp; | &nbsp;&nbsp;
        🚚 Freeship đơn từ 300K &nbsp;&nbsp; | &nbsp;&nbsp;
        🎧 Tai nghe giảm đến 30% &nbsp;&nbsp; | &nbsp;&nbsp;
        📱 iPhone giá tốt hôm nay &nbsp;&nbsp; | &nbsp;&nbsp;
        💻 Laptop sinh viên ưu đãi cực sốc &nbsp;&nbsp; | &nbsp;&nbsp;
        ⌚ Đồng hồ chính hãng giảm sâu &nbsp;&nbsp; | &nbsp;&nbsp;
        ⚡ Flash Sale mỗi ngày - Số lượng có hạn
      </div>
    </div>
  );
}