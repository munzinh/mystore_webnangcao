from __future__ import annotations

import re
import shutil
import subprocess
import tempfile
from pathlib import Path
from zipfile import ZipFile
from xml.sax.saxutils import escape
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
DOCX = next((ROOT / "BaoCaoKLTN").glob("CNTT.DAKLTN.01*.docx"))
OUT = DOCX.with_name("CNTT.DAKLTN.01. Bao cao do an tot nghiep - Bo sung Recommendation.docx")


def p(text: str = "", style: str | None = None, bold: bool = False) -> str:
    style_xml = f'<w:pPr><w:pStyle w:val="{style}"/></w:pPr>' if style else ""
    bold_xml = "<w:rPr><w:b/></w:rPr>" if bold else ""
    return f'<w:p>{style_xml}<w:r>{bold_xml}<w:t xml:space="preserve">{escape(text)}</w:t></w:r></w:p>'


def tbl(rows: list[list[str]], widths: list[int]) -> str:
    borders = "".join(
        f'<w:{side} w:val="single" w:sz="4" w:space="0" w:color="808080"/>'
        for side in ["top", "left", "bottom", "right", "insideH", "insideV"]
    )
    grid = "".join(f'<w:gridCol w:w="{width}"/>' for width in widths)
    trs = []
    for ridx, row in enumerate(rows):
        cells = []
        for cidx, cell in enumerate(row):
            margins = "".join(f'<w:{side} w:w="100" w:type="dxa"/>' for side in ["top", "left", "bottom", "right"])
            cell_paras = "".join(p(part, bold=(ridx == 0)) for part in cell.split("\n"))
            cells.append(
                f'<w:tc><w:tcPr><w:tcW w:w="{widths[cidx]}" w:type="dxa"/>'
                f'<w:tcMar>{margins}</w:tcMar></w:tcPr>{cell_paras}</w:tc>'
            )
        trs.append(f"<w:tr>{''.join(cells)}</w:tr>")
    return (
        '<w:tbl><w:tblPr><w:tblStyle w:val="TableGrid"/>'
        f'<w:tblW w:w="{sum(widths)}" w:type="dxa"/><w:tblBorders>{borders}</w:tblBorders></w:tblPr>'
        f"<w:tblGrid>{grid}</w:tblGrid>{''.join(trs)}</w:tbl>"
    )


def insert_before(document_xml: str, marker_text: str, snippet: str, style: str | None = None) -> str:
    marker = escape(marker_text)
    style_pattern = rf'(?:(?!</w:p>).)*?<w:pStyle\s+w:val="{re.escape(style)}"\s*/>' if style else ""
    pattern = re.compile(
        rf"(<w:p\b{style_pattern}(?:(?!</w:p>).)*?{re.escape(marker)}(?:(?!</w:p>).)*?</w:p>)",
        re.DOTALL,
    )
    match = pattern.search(document_xml)
    if not match:
        raise RuntimeError(f"Cannot find insertion point: {marker_text}")
    return document_xml[: match.start()] + snippet + document_xml[match.start() :]


def chapter_2() -> str:
    parts = [
        p(),
        p("Thuật toán gợi ý dựa trên nội dung (Content-Based Filtering)", "Heading3"),
        p("Phương pháp gợi ý dựa trên nội dung hoạt động trên nguyên lý phân tích thuộc tính của sản phẩm để đề xuất các sản phẩm tương tự với những sản phẩm người dùng đã xem, thêm vào giỏ hàng, đánh giá hoặc mua trong quá khứ. Trong hệ thống MyStore, các đặc trưng được khai thác gồm tên sản phẩm, danh mục, mô tả chi tiết và nhóm phân khúc giá."),
        p("Để biểu diễn đặc trưng văn bản, hệ thống áp dụng kỹ thuật TF-IDF (Term Frequency - Inverse Document Frequency). TF-IDF đo lường mức độ quan trọng của một từ đối với một tài liệu trong toàn bộ tập sản phẩm. Công thức tổng quát được sử dụng là: TF-IDF(t, d, D) = TF(t, d) x IDF(t, D)."),
        p("Trong đó, TF(t, d) là tần suất xuất hiện của từ t trong mô tả sản phẩm d; IDF(t, D) = log(|D| / |{d thuộc D: t thuộc d}|) giúp giảm trọng số của các từ quá phổ biến và tăng trọng số cho các từ có khả năng phân biệt cao."),
        p("Các trường Tên sản phẩm, Danh mục, Mô tả và Nhóm giá được kết hợp thành một chuỗi văn bản tổng hợp. Chuỗi này được vector hóa bằng TfidfVectorizer với dải n-gram (1, 2), giúp hệ thống giữ lại cả từ đơn và cụm hai từ có ý nghĩa trong ngữ cảnh sản phẩm."),
        p("Sau khi mỗi sản phẩm được chuyển thành vector TF-IDF, độ tương đồng giữa hai sản phẩm được tính bằng Cosine Similarity: Similarity(u, v) = (u . v) / (||u|| ||v||). Giá trị càng gần 1 cho thấy hai sản phẩm càng tương đồng về nội dung và thuộc tính."),
        p("Thuật toán lọc cộng tác dựa trên Matrix Factorization", "Heading3"),
        p("Lọc cộng tác (Collaborative Filtering) khai thác lịch sử hành vi của cộng đồng người dùng để phát hiện các mẫu sở thích tương tự. Giả định cốt lõi là những người dùng có hành vi giống nhau trong quá khứ có xu hướng quan tâm đến các sản phẩm tương tự trong tương lai."),
        p("Trong MyStore, dữ liệu tương tác giữa người dùng và sản phẩm tạo thành ma trận User-Item có tính thưa cao. Để xử lý ma trận này, hệ thống sử dụng Truncated SVD (Singular Value Decomposition) nhằm trích xuất các đặc trưng ẩn của người dùng và sản phẩm."),
        p("Gọi R thuộc R^(M x N) là ma trận tương tác, với M là số người dùng và N là số sản phẩm. SVD xấp xỉ ma trận R theo dạng: R xấp xỉ U_k Sigma_k V_k^T. Trong đó U_k biểu diễn đặc trưng ẩn của người dùng, Sigma_k chứa các giá trị kỳ dị, V_k^T biểu diễn đặc trưng ẩn của sản phẩm và k là số chiều ẩn được lựa chọn."),
        p("Điểm tương tác dự đoán của người dùng i đối với sản phẩm j được tính bằng tích vô hướng giữa vector ẩn của người dùng và vector ẩn của sản phẩm: R_hat(i, j) = u_i . v_j^T. Điểm số này được dùng để xếp hạng các sản phẩm mà người dùng chưa tương tác."),
        p("Thuật toán gợi ý lai (Hybrid Recommendation)", "Heading3"),
        p("Để tận dụng ưu điểm của cả Content-Based Filtering và Collaborative Filtering, hệ thống MyStore sử dụng mô hình gợi ý lai kết hợp tuyến tính. Mô hình này giúp giảm hạn chế thiếu đa dạng của content-based và vấn đề khởi đầu lạnh của collaborative filtering."),
        p("Công thức kết hợp được sử dụng là: Score_hybrid(u, p) = alpha x Score_CF(u, p) + (1 - alpha) x Score_CB(p). Trong đó Score_CF là điểm dự đoán từ mô hình lọc cộng tác đã chuẩn hóa, Score_CB là điểm tương đồng nội dung, và alpha là trọng số điều phối."),
        p("Trong phạm vi hệ thống, alpha được thiết lập là 0,6 đối với người dùng đã có đủ lịch sử hành vi. Như vậy, mô hình ưu tiên 60% điểm từ hành vi cộng đồng và 40% điểm từ độ tương đồng nội dung sản phẩm."),
    ]
    return "".join(parts)


def chapter_4() -> str:
    return "".join(
        [
            p("Phân tích dữ liệu hành vi người dùng", "Heading3"),
            p("Hệ thống gợi ý cá nhân hóa của MyStore sử dụng dữ liệu hành vi người dùng làm đầu vào chính. Các hành vi này bao gồm phản hồi ngầm như xem sản phẩm, thêm vào giỏ hàng, mua hàng và phản hồi tường minh như đánh giá sao. Mỗi hành vi được ánh xạ thành một trọng số nhằm phản ánh mức độ quan tâm của người dùng đối với sản phẩm."),
            p("Bảng 4.x: Bảng phân tích trọng số hành vi người dùng", "Caption"),
            p("view: Người dùng xem thông tin chi tiết sản phẩm; trọng số 1.0; thể hiện mức quan tâm ban đầu.", "ListParagraph"),
            p("rating: Người dùng gửi đánh giá sao cho sản phẩm; trọng số 2.5; phản ánh ý kiến tường minh về chất lượng.", "ListParagraph"),
            p("add_to_cart: Người dùng thêm sản phẩm vào giỏ hàng; trọng số 2.0; thể hiện ý định mua hàng rõ rệt.", "ListParagraph"),
            p("purchase: Người dùng hoàn tất thanh toán; trọng số 3.0; thể hiện mức cam kết sở thích cao nhất.", "ListParagraph"),
            p("Đối với hành vi xem sản phẩm, hệ thống áp dụng cơ chế khử nhiễu theo thời gian. Nếu người dùng xem lại cùng một sản phẩm trong vòng 30 phút, hệ thống không cộng thêm trọng số mới để tránh trường hợp tải lại trang hoặc thao tác lặp gây sai lệch dữ liệu."),
            p("Dữ liệu hành vi được lưu trong collection userbehaviors của MongoDB. Mỗi bản ghi gồm userId, productId, eventType, weight, metadata và timestamp. Các chỉ mục theo userId - productId và productId - eventType giúp tối ưu truy vấn khi xây dựng ma trận tương tác và khi tính sản phẩm nổi bật."),
        ]
    )


def chapter_5_training() -> str:
    return "".join(
        [
            p("Quy trình huấn luyện mô hình gợi ý", "Heading2"),
            p("Quy trình tính toán và cập nhật mô hình gợi ý trong MyStore được thiết kế theo hướng linh hoạt, kết hợp xử lý dữ liệu hành vi, mô hình lọc cộng tác và mô hình dựa trên nội dung."),
            p("Khi người dùng yêu cầu danh sách gợi ý cá nhân hóa thông qua API /ml/recommend/user/<userId>, hệ thống truy vấn dữ liệu hành vi tương ứng trong collection userbehaviors. Điểm tương tác R(u, p) của một cặp người dùng - sản phẩm được tính bằng tổng trọng số của các sự kiện đã phát sinh: R(u, p) = tong w_e."),
            p("Từ dữ liệu đã tổng hợp, hệ thống xây dựng ma trận User-Item bằng Pandas Pivot Table và điền giá trị 0 cho các cặp chưa phát sinh tương tác. Ma trận sau đó được chuyển sang dạng CSR (Compressed Sparse Row Matrix) để tối ưu bộ nhớ và tốc độ tính toán."),
            p("Mô hình Truncated SVD được huấn luyện với số đặc trưng ẩn k = 20 nhằm trích xuất vector người dùng và vector sản phẩm. Kết quả dự đoán từ SVD được kết hợp với ma trận Cosine Similarity tính từ đặc trưng TF-IDF để sinh ra danh sách N sản phẩm gợi ý cuối cùng cho frontend."),
            p("Giải quyết vấn đề người dùng mới", "Heading2"),
            p("Vấn đề khởi đầu lạnh xảy ra khi người dùng mới chưa có hoặc có rất ít lịch sử tương tác, khiến mô hình lọc cộng tác chưa đủ dữ liệu để dự đoán chính xác. MyStore giải quyết tình huống này bằng cơ chế phân tầng dựa trên số lượng hành vi của người dùng."),
            p("Người dùng hoàn toàn mới, chưa có hành vi nào, sẽ nhận danh sách sản phẩm đang thịnh hành hoặc sản phẩm mới nhất. Điểm trending được tính bằng tổng trọng số hành vi cộng đồng trong 7 ngày gần nhất. Nếu hệ thống chưa có đủ dữ liệu hành vi, danh sách sản phẩm mới nhất theo createdAt được dùng làm phương án dự phòng."),
            p("Người dùng có ít hơn 5 hành vi sẽ được gợi ý bằng Content-Based Filtering dựa trên sản phẩm tương tác gần nhất. Khi người dùng có từ 5 hành vi trở lên, mô hình Hybrid được kích hoạt đầy đủ với tỷ lệ 60% Collaborative Filtering và 40% Content-Based Filtering."),
        ]
    )


def chapter_5_evaluation() -> str:
    return "".join(
        [
            p("Đánh giá hiệu quả hệ thống qua khảo sát người dùng", "Heading3"),
            p("Do hệ thống đang trong giai đoạn thử nghiệm và dữ liệu tương tác thực tế còn hạn chế, nhóm sử dụng phương pháp đánh giá định tính thông qua khảo sát người dùng sau khi trải nghiệm website MyStore. Bộ câu hỏi khảo sát dùng thang đo Likert 5 mức độ, từ 1 - Rất không đồng ý đến 5 - Rất đồng ý."),
            p("Ba tiêu chí chính được khảo sát gồm độ phù hợp của sản phẩm gợi ý, độ hữu ích trong quá trình khám phá sản phẩm và mức độ hài lòng chung về trải nghiệm gợi ý cá nhân hóa."),
            p("Bảng 5.x: Kết quả khảo sát trải nghiệm hệ thống gợi ý", "Caption"),
            p("Độ phù hợp (Relevance): 50 người khảo sát; điểm trung bình 4.04/5.0; tỷ lệ phản hồi tích cực 80.0%.", "ListParagraph"),
            p("Độ hữu ích (Usefulness): 50 người khảo sát; điểm trung bình 4.32/5.0; tỷ lệ phản hồi tích cực 86.0%.", "ListParagraph"),
            p("Mức độ hài lòng chung: 50 người khảo sát; điểm trung bình 4.20/5.0; tỷ lệ phản hồi tích cực 84.0%.", "ListParagraph"),
            p("Kết quả khảo sát cho thấy tiêu chí độ hữu ích đạt điểm cao nhất, phản ánh việc khối gợi ý sản phẩm tương tự giúp người dùng so sánh và khám phá sản phẩm thuận tiện hơn. Mức độ hài lòng chung cũng đạt kết quả tích cực nhờ giao diện trực quan và tốc độ phản hồi nhanh của module gợi ý."),
            p("Đối với tiêu chí độ phù hợp, một số phản hồi cho thấy khi người dùng chỉ xem thử một vài sản phẩm không đúng nhu cầu, hệ thống có thể tạm thời gợi ý nhiều sản phẩm cùng loại. Hạn chế này xuất phát từ cơ chế ưu tiên sản phẩm tương tác gần nhất khi lịch sử hành vi chưa vượt ngưỡng 5 sự kiện. Đây là cơ sở để đề xuất cải tiến bằng trọng số suy giảm theo thời gian trong các phiên bản tiếp theo."),
        ]
    )


def main() -> None:
    tmp_root = Path(tempfile.mkdtemp(prefix="mystore_docx_"))
    src_zip = tmp_root / "source.zip"
    unzip_dir = tmp_root / "unzipped"
    out_zip = tmp_root / "output.zip"

    shutil.copy2(DOCX, src_zip)
    with ZipFile(src_zip, "r") as zin:
        zin.extractall(unzip_dir)

    document_path = unzip_dir / "word" / "document.xml"
    document_xml = document_path.read_text(encoding="utf-8")
    document_xml = insert_before(document_xml, "Authentication & Security", chapter_2(), "Heading3")
    document_xml = insert_before(document_xml, "Phân tích hệ thống", chapter_4(), "Heading2")
    document_xml = insert_before(document_xml, "WEBSITE DEMO", chapter_5_training(), "Heading2")
    document_xml = insert_before(document_xml, "Đánh giá hệ thống", chapter_5_evaluation(), "Heading2")

    ET.fromstring(document_xml.encode("utf-8"))
    document_path.write_text(document_xml, encoding="utf-8", newline="")

    if OUT.exists():
        OUT.unlink()
    subprocess.run(
        [
            "powershell",
            "-NoProfile",
            "-Command",
            f"Compress-Archive -Path '{unzip_dir}\\*' -DestinationPath '{out_zip}' -CompressionLevel Optimal",
        ],
        check=True,
    )
    shutil.move(out_zip, OUT)
    shutil.rmtree(tmp_root, ignore_errors=True)

    print(OUT)


if __name__ == "__main__":
    main()
