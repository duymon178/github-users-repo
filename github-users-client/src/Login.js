import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const USER_KEY = "GITHUB_USERS_ID";

export default function Login() {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [submitted, setSubmtited] = useState(false);
  const [invalidCode, setInvalidCode] = useState(false);

  useEffect(() => {
    const user = window.localStorage.getItem(USER_KEY);

    if (user) {
      navigate("/");
    }
  }, [navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setInvalidCode(false);

    const response = await fetch(
      "http://localhost:3000/api/create-new-access-code",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
        }),
      }
    );

    if (response.ok) {
      setSubmtited(true);
    }
  }

  async function handleValidate(e) {
    e.preventDefault();

    const response = await fetch(
      "http://localhost:3000/api/validate-access-code",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          accessCode: accessCode,
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();

      if (data.success) {
        window.localStorage.setItem(USER_KEY, phoneNumber);
        navigate("/");
      } else {
        setSubmtited(false);
        setInvalidCode(true);
      }
    }
  }

  return (
    <>
      <div>
        {invalidCode && <div className="error">Invalid access code!</div>}
        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <label htmlFor="phoneNumber">Enter your phone number:</label>
            <input
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
              }}
            />
            <input
              type="submit"
              value="Submit"
              disabled={phoneNumber.length === 0}
            />
          </form>
        ) : (
          <form onSubmit={handleValidate}>
            <label htmlFor="accessCode">Enter your access code:</label>
            <input
              id="accessCode"
              value={accessCode}
              onChange={(e) => {
                setAccessCode(e.target.value);
              }}
            />
            <input
              type="submit"
              value="Validate"
              disabled={accessCode.length === 0}
            />
          </form>
        )}
      </div>
    </>
  );
}
