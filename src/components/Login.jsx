import { GoogleLogin } from '@react-oauth/google';

const TOKEN_KEY = 'corpboard_id_token';

export default function Login({ onLogin }) {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#f8fafc] text-[#1E293B]">
      <div className="bg-white rounded-2xl shadow-md border border-[#1E293B]/10 p-10 flex flex-col items-center gap-6 w-full max-w-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-extrabold text-[#10B981]">Corp</span>
          <span className="text-2xl font-extrabold text-[#1E293B]">Board</span>
        </div>
        <p className="text-[#1E293B]/60 text-sm text-center">
          社内ディスカッションプラットフォームへようこそ。<br />
          Googleアカウントでログインしてください。
        </p>
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            const idToken = credentialResponse.credential;
            localStorage.setItem(TOKEN_KEY, idToken);
            onLogin();
          }}
          onError={() => {
            console.error('Google login failed');
          }}
          width="320"
        />
      </div>
    </div>
  );
}
