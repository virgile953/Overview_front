"use client";

export default function Logs() {
  return (
    <div className="flex flex-col">
      Logs Page - Protected Content
      <button className="border p-2 rounded-lg m-2" onClick={() => {
        fetch('/api/send-mail', {
          method: 'POST',
          headers: {  'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'virgile.barbera@gmail.com',
            subject: 'Test Email',
          }),
        })
          .then(res => res.json())
          .then(data => console.log(data))
          .catch(err => console.error(err));
      }}>
        Test MJ API
      </button>
    </div>
  );
}