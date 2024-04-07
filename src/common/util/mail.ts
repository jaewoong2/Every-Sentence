export const MAIL_DESCRIPTION = (link: string) => `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>회원 가입 확인</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 16px; color: #333; background-color: #eee;">
    <div style="width: 100%; max-width: 600px; margin: auto; background: #fff;">
        <!-- Header -->
        <div style="padding: 20px; text-align: center; background: #fff; border-bottom: 1px solid #ddd;">
            <img src="https://images.prlc.kr/logo.png" alt="Logo" style="width: 120px;">
            <h1 style="font-size: 24px; color: #333; margin: 0; padding: 0;">Prlc.kr</h1>
        </div>
        
        <!-- Body -->
        <div style="padding: 20px; text-align: center;">
            <p style="color: #333; line-height: 1.5; margin: 0; padding: 0;">안녕하세요!</p>
            <p style="color: #333; line-height: 1.5; margin: 0; padding: 0;">회원가입을 계속하려면 하단의 버튼을 클릭해주세요.<br>만약 실수로 요청하셨거나, 요청하지 않았다면, 이 메일을 무시하세요.</p>
        </div>
        
        <!-- Button -->
        <div style="text-align: center; padding: 25px;">
            <a href="${link}" style="background-color: #4C63D2; padding: 10px 20px; border-radius: 5px; font-weight: bold; font-size: 18px; color: #fff; text-decoration: none;">계속하기</a>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #4C63D2; color: #fff; text-align: center; padding: 10px; font-size: 14px;">
            이 링크는 24시간 동안 유효합니다.
        </div>
    </div>
</body>
</html>
`;
