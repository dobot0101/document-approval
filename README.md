### 사용 기술

- Node.js, Express, Typescript
- MySQL, TypeORM
- Jest

### 공통 환경설정

1. 로컬에 MySQL DB 생성 (서버용, 테스트용으로 총 2개 생성)
2. /.env 파일의 값들을 본인의 환경에 맞게 변경
3. npm install

### API 사용 방법

1. 터미널에 npm start 또는 npm run dev 입력
2. 아래의 내용을 참고하여 Request에 url, body(JSON), header, path 파라미터를 포함하여 요청

   - 회원가입
     - POST /user/signup
     - body(JSON)
       |이름|타입|
       |---|---|
       |email|string|
       |password|string|
       |name|string|
   - 로그인
     - POST /user/login
     - body(JSON)
       |이름|타입|
       |---|---|
       |email|string|
       |password|string|
   - 결재 요청

     - POST /approval-request/request
     - header

       - Authorization > Bearer Token에 로그인 토큰 입력
       - 예) eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImQ3ZGVhMjJjLTQzYjQtNDBiMC05OWU4LTcwZjliMTk5MjI3MyIsImlhdCI6MTY2OTA0MjQzMH0.9Qbi_HNpSPikmSRXz5yXd92rviAkj5NnaXiKBElzcTM

     - body(JSON)  
       |이름|타입|
       |---|---|
       |title|string|
       |content|string|
       |type|"VACATION" / "DISBURSEMENT"|
       |approvalLineInputs|{approverId: string, order: number} 객체의 배열, approverId는 회원아이디|

   - 결재 승인
     - POST /approval-request/approve/:approvalLineId
     - header
       - Authorization > Bearer Token에 로그인 토큰 입력
     - path (:approvalLineId)
       - 결재 요청 response 값 중 approvalLineId을 입력  
         예) 426f3fde-7a4a-442a-9aa0-cb6aef04ac70
     - body(JSON)  
       |이름|타입|
       |---|---|
       |comment|string|
   - 결재 거절
     - POST /approval-request/reject/:approvalLineId
     - header
       - Authorization > Bearer Token에 로그인 토큰 입력
     - path (:approvalLineId)
       - 결재 요청 response 값 중 approvalLineId을 입력  
         예) 426f3fde-7a4a-442a-9aa0-cb6aef04ac70
     - body(JSON)  
       |이름|타입|
       |---|---|
       |comment|string|
   - INBOX 조회
     - POST /approval-request/list/inbox
     - header (Authorization > Bearer Token에 로그인 토큰 입력)
   - OUTBOX 조회
     - POST /approval-request/list/outbox
     - header (Authorization > Bearer Token에 로그인 토큰 입력)
   - ARCHIVE 조회
     - POST /approval-request/list/archive
     - header (Postman 사용 시 Authorization > Bearer Token에 로그인 토큰 입력)

3. 사용 시나리오
   - 결재 요청
     - 회원가입 > 로그인 > 결재 요청
       - 결재 라인으로 설정할 회원들도 가입 필요
       - 결재 승인/거절 테스트 시 order(순서) 값에 유의
   - 결재 승인
     - 결재 요청 > INBOX 조회 > 결재 승인
       - INBOX 조회 결과 중 nextApprovalLineId 값을 결재 승인 요청 시 path 파라미터로 입력
   - 결재 거절
     - 결재 요청 > INBOX 조회 > 결재 거절
       - INBOX 조회 결과 중 nextApprovalLineId 값을 결재 거절 요청 시 path 파라미터로 입력

### 테스트 코드 실행 방법

1. 위의 공통 환경설정에서 말한 테스트용 DB와 .env의 TEST_DB_DATABASE 값이 일치하는지 확인
2. 터미널에 npm test 입력
