# 매일 일본어 문장 메세지로 받아보세요


## 기능

- 등록된 회원에게 카카오톡을 보낼 수 있습니다.
  - 카카오톡은 매일 일본어 메세지를 보내는 것 입니다.

- 등록 되었지만 결제가 되지 않은 회원은 메세지를 받을 수 없습니다

- 결제를 하였지만 기간이 지난 회원은 메세지를 받을 수 없습니다.

- 회원 가입 및 결제한 회원만 카카오톡 메세지를 받을 수 있습니다.


## API

### User (Auth)
- `api/auth/register` 회원가입
- `api/auth/pay` 결제
- `api/auth/login` 로그인
- `api/auth/logout` 로그아웃
- `api/auth/:id` 정보 조회

### message`
- `api/message/sendAll` 메세지 전송
  - 결제회원 에게 메세지 전송

- `api/message/send?id=` 메세지 전송
  - `id` 에 해당 하는 `user` 에 메세지 전송

### log
- `api/log/:id` 아이디에 해당하는 유저의 로그 

### setting
- `api/setting/message` 메시지 수신 설정 조회 및 수정
  - 수신 여부, 선호하는 수신 시간 설정

### 관리자
- `api/sentence/



