Bạn là Senior Node.js Package Architect (10+ năm), chuyên thiết kế package dạng CJS có thể chạy đa môi trường (Windows/Linux), tối ưu cho tái sử dụng và chia nhỏ nghiệp vụ.
Mục tiêu: tạo một NodeJS package theo mô tả bên dưới, tuân thủ tuyệt đối các quy tắc và output đầy đủ project skeleton + code.

────────────────────────────────────────
🧩 Step 1 — Xác định vai trò
Bạn đóng vai:

- Architect: thiết kế kiến trúc + module theo nghiệp vụ
- Implementer: viết code JS thuần (KHÔNG TypeScript)
- Maintainer: kèm scripts build/publish/version bump tối thiểu
- Không làm test/lint/format trong bản chính (nhưng phải gợi ý cách bật thêm tùy chọn)

────────────────────────────────────────
🧾 Step 2 — Mô tả nhiệm vụ / dự án
Tên package: runner-tailscale-sync
Mô tả ngắn: Đồng bộ runner-data giữa các runner trên Github actions, Pipeline azure..

Loại package:

- CLI: có lệnh chạy từ terminal
- Library: có thể import dùng trong project khác
  => Yêu cầu: HYBRID (vừa CLI vừa import được)

Các command chính (có thể sửa):

Input/Output mong muốn:

- Input: Chạy trên 2 runner (trước và sau)
- Output: Đồng bộ tất cả dữ liệu trong runner chạy trước về cùng tên với thư mục trong runner chạy sau

Nghiệp vụ chính (core business logic) giành cho Runner:

- Luồng cơ bản: `runner01` ☞ `write data on .runner-data` ☞ `55 phút sau` ☞ `runne02 start` ☞ `pull .runner-data từ 01` ☞ `stop service trên 01` ☞ `start service` ☞ `push .runner-data` lên repo (xoay vòng liên tục giữa `runner01` và `runner02`)
- Khởi chạy, tất cả dữ liệu được lưu trong `.runner-data`
- Join và mạng tailsacle theo `.env`: `TAILSCALE_CLIENT_ID` và `TAILSCALE_CLIENT_SECRET`, nếu window thì không enabel `ssh`, cấu hình tương ứng

```const cmd = [
    "sudo",
    "tailscale",
    "up",
    `--client-id=${clientId}`,
    `--client-secret=${clientSecret}`,
    "--accept-routes",
    "--accept-dns=true",
    utils.isLinux === true ? "--ssh" : "",
    tagStr,
  ]
    .filter(Boolean)
    .join(" ");
```

- Khởi chạy, tất cả dữ liệu được lưu trong `.runner-data`
- Khi bắt đầu chạy lên, sẽ dùng `tailscale status --json` để xác định máy chạy trước đó có kiểm tra cùng tag, đang active và không phải chính nó, nếu có thì xác định `IP` và thực hiện các bước sau:
  1. `pull` thư mục `.runner-data` về máy hiện tại (tránh lỗi nếu thư mục chưa tồn tại)
  2. `pull xong`: thực hiện tiếp các lệnh `ssh` để stop các dịch vụ trên máy đó, ví dụ như `cloudflare`, `pocketbase serve`, `http webserver`...
- `push code` thư mục `.runner-data` lên repo hiện tại đang thực hiện (tránh xung đột git)
- Đính kèm code mẫu đang chạy ok, các nghiệp vụ chính hãy theo logic file mẫu này: [setup-tailscale.js](:/e10f784c0d87459e9c2c0134f757b961)

Ràng buộc môi trường:

- Node >= 20 (Khi dùng fetch, hãy dùng mặc định của nodeJS có sẵn)
- Hỗ trợ Windows + Linux (Có sử dụng các app bên ngoài có thể đề xuất cài đặt thêm, trên window có thể cấu hình đường dẫn tới file thực thi `exe`)
- Chạy ổn trong CI runner (github actions/self-host runner)

────────────────────────────────────────
🪜 Step 3 — Yêu cầu hướng dẫn & triển khai theo từng bước (step-by-step)
Bạn PHẢI thiết kế theo pipeline chuẩn cho từng command/feature:

- parseInput()
- validate()
- plan()
- execute()
- report()

Mỗi bước là function riêng + tách file rõ ràng.
Logic nghiệp vụ nằm ở src/core (KHÔNG nhét vào scripts).
Scripts chỉ gọi core để chạy tác vụ build/publish/version.

────────────────────────────────────────
🧪 Step 4 — Yêu cầu ví dụ minh hoạ (bắt buộc có)
Bạn phải kèm:

- Ví dụ chạy CLI (3–5 ví dụ)
- Ví dụ import dùng như library (2–3 ví dụ)
- Ví dụ cấu hình CWD + .runner-data + log/pid/data-services

────────────────────────────────────────
🎯 Step 5 — Xác định đối tượng mục tiêu
Đối tượng: DevOps/Engineer có kinh nghiệm, cần tool chạy nhanh, rõ cấu trúc, dễ mở rộng.
Ưu tiên: ít phụ thuộc, code rõ ràng, module hoá, dễ debug.

────────────────────────────────────────
🧾 Step 6 — Yêu cầu định dạng đầu ra (bắt buộc đúng format)
Bạn phải output theo thứ tự:

1. Tổng quan kiến trúc (ngắn, rõ)
2. Cây thư mục (file tree)
3. Giải thích từng nhóm module theo nghiệp vụ
4. Code đầy đủ cho tất cả file (JS thuần)
5. Hướng dẫn dùng (CLI + library)
6. Scripts build/publish/version bump tối thiểu
7. Mục “Tùy chọn bật thêm” (lint/test/ci/bundle/docs) chỉ liệt kê hướng, KHÔNG triển khai mặc định

Lưu ý trình bày:

- Không tạo file TypeScript
- Không viết test/lint trong bản chính
- Không bỏ sót file nào trong file tree: file nào có trong tree thì phải có code

────────────────────────────────────────
🧰 Step 7 — Gợi ý công cụ hỗ trợ (tùy chọn bật thêm)
Bạn chỉ gợi ý:

- ESLint / Prettier
- node:test hoặc vitest
- GitHub Actions publish
- esbuild bundle (nếu muốn)
- docs generator (nếu muốn)
  => chỉ “hướng dẫn bật”, không triển khai mặc định

────────────────────────────────────────
✅ QUY TẮC KIẾN TRÚC BẮT BUỘC
📌 1) Module format: 🟨 CJS (require/module.exports) để tương thích cao.
📌 2) Chia theo domain:

- src/core/ (logic nghiệp vụ)
- src/adapters/ (fs/http/spawn/git…)
- src/cli/ (parse args, commands)
- src/utils/ (logger, time, json, retry, errors…)
- scripts/ (build/publish/version bump… gọi core, không chứa nghiệp vụ)
- bin/ (entry CLI)

📌 3) Logging & version in logs:

- Mọi log/print quan trọng phải kèm: packageName + version + command + timestamp
- Khi CLI chạy, in ghi chú “Đang thực thi version: X”
- Cho phép --verbose / --quiet

📌 4) CWD & .runner-data layout (bắt buộc hỗ trợ cấu hình):

- Có option cấu hình working directory:
  - CLI flag: --cwd <path> (ưu tiên cao nhất)
  - env: TOOL_CWD
  - default: process.cwd()
- Tất cả dữ liệu/ghi file nằm trong: <cwd>/.runner-data/
  - logs: .runner-data/logs/
  - pid: .runner-data/pid/
  - data: .runner-data/data-services/
  - tmp/cache: .runner-data/tmp/
- Không ghi lung tung ra thư mục khác.

📌 5) Error handling chuẩn:

- Có lớp lỗi: ValidationError, NetworkError, ProcessError
- Exit code rõ ràng:
  - 0: success
  - 2: validation/config error
  - 10: network error
  - 20: process/spawn error
  - 1: unknown error
- Log lỗi có hint hành động tiếp theo

📌 6) Adapter layer:

- fs adapter: read/write json, ensureDir, atomic write
- http adapter: fetch with timeout + retry
- process adapter: spawn cross-platform (khuyến nghị cross-spawn hoặc child_process spawn + fix windows)
- time adapter: lấy giờ Việt Nam (Asia/Ho_Chi_Minh) cho version & log timestamp

────────────────────────────────────────
📦 QUY TẮC VERSIONING (RẤT QUAN TRỌNG)
Bạn phải dùng version theo giờ Việt Nam, format hiển thị mong muốn:

- DISPLAY_VERSION = "1.yyMMdd.1HHmm" (24h)

⚠️ NPM version phải hợp lệ semver.
Bạn phải triển khai một mapping đảm bảo:

- PACKAGE_JSON_VERSION (semver hợp lệ) vẫn tăng theo thời gian
- DISPLAY_VERSION vẫn đúng format tôi yêu cầu và được log ra khi chạy

Gợi ý mapping (bắt buộc implement một cách rõ ràng):

- package.json version: "1.yyMMdd.1HHmm" (semver hợp lệ: prerelease numeric)
- display version: "1.yyMMdd.1HHmm"

Bạn phải cung cấp:

- script tạo version mới theo giờ VN
- script bump version (ghi vào package.json)
- đảm bảo nếu build sau thì so sánh semver vẫn “lớn hơn” build trước (theo thời gian)

────────────────────────────────────────
🚀 YÊU CẦU VỀ DEPENDENCIES

- Ưu tiên ít phụ thuộc
- Nếu dùng thư viện (commander/chalk/cross-spawn), phải giải thích vì sao cần
- Mặc định: không dùng quá 3 dependency runtime

────────────────────────────────────────
🎁 DELIVERABLE CHỐT
Hãy tạo project hoàn chỉnh cho {{PACKAGE_NAME}} gồm:

- File tree chuẩn
- Tất cả code JS (CJS)
- CLI có commands theo mô tả
- logs có version + command + timestamp
- Hỗ trợ --cwd và .runner-data layout
- Scripts version/build/publish tối thiểu
- Hướng dẫn dùng + ví dụ
- Thực hiện xong dự án ngoài thể hiện các thông tin đã thực hiện thì thực hiện thêm nén tất cả file, thông tin thành zip để download.

- HÃY THỰC HIỆN GIÚP TÔI.
