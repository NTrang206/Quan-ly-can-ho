"""
agent_runner.py - Engine điều phối phân tích yêu cầu tích hợp trong Skill Dwell Living.
Đóng vai trò: Senior Business Analyst kiêm Software System Architect.
"""

import argparse
import os
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI


SCRIPT_DIR = Path(__file__).resolve().parent
SKILL_DIR = SCRIPT_DIR.parent
AGENTS_ROOT = SKILL_DIR.parent.parent
WORKSPACE_DIR = AGENTS_ROOT.parent

PROMPT_PATH = SKILL_DIR / "resources" / "requirement_agent.md"
RULES_PATH = AGENTS_ROOT / "rules" / "project_rules.md"
DEFAULT_OUTPUT_DIR = SKILL_DIR / "outputs"


def load_system_prompt() -> str:
    """Tải system prompt từ resources và quy chuẩn project_rules.md."""
    if not PROMPT_PATH.exists():
        raise FileNotFoundError(f"Không tìm thấy system prompt tại: {PROMPT_PATH}")

    system_prompt = PROMPT_PATH.read_text(encoding="utf-8")

    # Nạp quy chuẩn kiến trúc từ .agents/rules/project_rules.md
    if RULES_PATH.exists():
        rules_content = RULES_PATH.read_text(encoding="utf-8")
        system_prompt += f"\n\n# QUY CHUẨN KIẾN TRÚC MÃ NGUỒN DỰ ÁN (TỪ PROJECT_RULES.MD):\n{rules_content}"

    return system_prompt


def run_requirements_agent(
    user_requirement: str,
    output_file: str | None = None,
    verbose: bool = True,
) -> str:
    """Phân tích một yêu cầu phần mềm theo tiêu chuẩn Senior BA & System Architect."""
    if not user_requirement or not user_requirement.strip():
        raise ValueError("Yêu cầu đầu vào không được để trống.")

    # Nạp API Key (từ .agents/skills/requirement-system-architect/.env hoặc backend/.env)
    load_dotenv(SKILL_DIR / ".env")
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        load_dotenv(WORKSPACE_DIR / "backend" / ".env")
        api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise RuntimeError(
            "Thiếu GEMINI_API_KEY. Vui lòng cấu hình trong .agents/skills/requirement-system-architect/.env hoặc backend/.env."
        )

    model = os.getenv("GEMINI_MODEL", "gemini-3.1-flash-lite")

    system_prompt = load_system_prompt()
    client = OpenAI(
        api_key=api_key,
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
    )

    if verbose:
        print("🤖 Agent đang phân tích yêu cầu theo chuẩn Dwell Living...\n")

    response = client.chat.completions.create(
        model=model,
        temperature=0.2,
        messages=[
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": f"Phân tích yêu cầu sau cho hệ thống Quản lý Căn hộ Dwell Living:\n{user_requirement}",
            },
        ],
    )

    result = response.choices[0].message.content
    if not result:
        raise RuntimeError("Model trả về nội dung rỗng.")

    if verbose:
        print(result)

    if output_file:
        output_path = Path(output_file)
        if not output_path.is_absolute():
            output_path = SKILL_DIR / output_path
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(result, encoding="utf-8")
        if verbose:
            print(f"\n✅ Đã lưu kết quả phân tích vào: {output_path}")

    return result


def main():
    parser = argparse.ArgumentParser(
        description="Dwell Living Requirement AI Agent - Phân tích yêu cầu chuẩn BA & Architect"
    )
    parser.add_argument(
        "--req",
        "-r",
        type=str,
        help="Nội dung yêu cầu tính năng (Raw Requirement)",
    )
    parser.add_argument(
        "--output",
        "-o",
        type=str,
        default="outputs/analyzed_feature.md",
        help="Tệp markdown lưu kết quả (mặc định: outputs/analyzed_feature.md)",
    )
    args = parser.parse_args()

    if args.req:
        run_requirements_agent(args.req, args.output)
    else:
        # Ví dụ mẫu thực tế của Dwell Living khi chạy không có đối số
        sample_requirement = """
        Thêm tính năng tự động ghi nhận chỉ số công tơ điện nước định kỳ hàng tháng bằng cách
        cho phép nhân viên tòa nhà chụp ảnh đồng hồ từ điện thoại. Hệ thống tự nhận diện số bằng AI,
        so sánh với chỉ số tháng trước để cảnh báo bất thường, và tự động tạo hóa đơn tiền tệ gửi khách thuê.
        """
        run_requirements_agent(
            user_requirement=sample_requirement,
            output_file="outputs/dwell_living_meter_reading_spec.md",
        )


if __name__ == "__main__":
    main()
