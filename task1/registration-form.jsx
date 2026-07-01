import { useState } from "react";

const GENDERS = ["Female", "Male", "Non-binary", "Prefer not to say"];

function calcAge(dobString) {
  const dob = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

function validate(values) {
  const errors = {};

  const name = values.name.trim();
  if (!name) errors.name = "Enter your full name.";
  else if (!/^[A-Za-z][A-Za-z\s'-]{1,49}$/.test(name))
    errors.name = "Use letters only, at least 2 characters.";

  const email = values.email.trim();
  if (!email) errors.email = "Enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
    errors.email = "Enter a valid email address.";

  if (!values.dob) errors.dob = "Enter your date of birth.";
  else {
    const dobDate = new Date(values.dob);
    if (dobDate > new Date())
      errors.dob = "Date of birth can't be in the future.";
    else if (calcAge(values.dob) < 18)
      errors.dob = "You must be 18 or older to register.";
  }

  const mobile = values.mobile.trim();
  if (!mobile) errors.mobile = "Enter your mobile number.";
  else if (!/^\d{10}$/.test(mobile))
    errors.mobile = "Enter a 10-digit mobile number.";
  else if (!/^6/.test(mobile))
    errors.mobile = "Mobile number must start with 6.";

  if (!values.gender) errors.gender = "Select your gender.";

  return errors;
}

export default function RegistrationForm() {
  const [values, setValues] = useState({
    name: "",
    email: "",
    dob: "",
    mobile: "",
    gender: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field) => (e) => {
    let val = e.target.value;
    if (field === "mobile") val = val.replace(/\D/g, "").slice(0, 10);
    const next = { ...values, [field]: val };
    setValues(next);
    if (touched[field]) {
      setErrors(validate(next));
    }
  };

  const handleBlur = (field) => () => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validate(values));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const allTouched = Object.fromEntries(
      Object.keys(values).map((k) => [k, true])
    );
    setTouched(allTouched);
    const newErrors = validate(values);
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setSubmitted(true);
    }
  };

  const handleReset = () => {
    setValues({ name: "", email: "", dob: "", mobile: "", gender: "" });
    setErrors({});
    setTouched({});
    setSubmitted(false);
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="rf-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');

        .rf-root {
          --bg: #e8f6f0;
          --hex-a: #9fe3b8;
          --hex-b: #57c48a;
          --ink: #142a22;
          --sub: #52645d;
          --line: rgba(79, 157, 128, 0.28);
          --line-focus: #3f8c6e;
          --field-bg: rgba(255, 255, 255, 0.38);
          --accent: #1f8a5b;
          --accent-dark: #146245;
          --error: #c94f4f;

          position: relative;
          min-height: 100vh;
          width: 100%;
          background:
            radial-gradient(900px 600px at 12% 8%, rgba(159, 227, 184, 0.55), transparent 60%),
            radial-gradient(800px 560px at 88% 92%, rgba(87, 196, 138, 0.5), transparent 60%),
            linear-gradient(160deg, #eafaf3, #dcf1e8 55%, #cfeadf);
          font-family: 'Inter', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 40px 20px;
          box-sizing: border-box;
        }

        .rf-root *, .rf-root *::before, .rf-root *::after {
          box-sizing: border-box;
        }

        .rf-hex {
          position: absolute;
          clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
          background: linear-gradient(160deg, var(--hex-a), var(--hex-b));
          filter: blur(0.5px);
        }
        .rf-hex-1 { width: 340px; height: 340px; top: -150px; left: -120px; opacity: 0.65; }
        .rf-hex-2 { width: 210px; height: 210px; top: -15px; left: 50px; opacity: 0.4; }
        .rf-hex-3 { width: 300px; height: 300px; bottom: -140px; right: -100px; opacity: 0.6; }
        .rf-hex-4 { width: 180px; height: 180px; bottom: -15px; right: 40px; opacity: 0.38; }

        .rf-glow {
          position: absolute;
          width: 460px;
          height: 460px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(87, 196, 138, 0.45), transparent 70%);
          filter: blur(10px);
          z-index: 1;
        }
        .rf-glow-1 { top: -180px; left: -140px; }
        .rf-glow-2 { bottom: -200px; right: -160px; background: radial-gradient(circle, rgba(159, 227, 184, 0.5), transparent 70%); }

        .rf-card {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 460px;
          background: rgba(255, 255, 255, 0.42);
          backdrop-filter: blur(28px) saturate(165%);
          -webkit-backdrop-filter: blur(28px) saturate(165%);
          border-radius: 24px;
          padding: 44px 40px 38px;
          border: 1px solid rgba(255, 255, 255, 0.65);
          box-shadow:
            0 30px 70px -24px rgba(15, 46, 34, 0.35),
            0 2px 8px rgba(15, 46, 34, 0.06),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          overflow: hidden;
        }

        .rf-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent);
        }

        .rf-card::after {
          content: "";
          position: absolute;
          top: -60%;
          left: -20%;
          width: 70%;
          height: 140%;
          background: linear-gradient(115deg, rgba(255,255,255,0.35), transparent 55%);
          pointer-events: none;
          transform: rotate(8deg);
        }

        .rf-lines {
          position: absolute;
          top: 0;
          right: -40px;
          width: 220px;
          height: 100%;
          pointer-events: none;
          opacity: 0.35;
        }

        .rf-mark {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 28px;
        }

        .rf-mark svg { flex-shrink: 0; }

        .rf-mark-text {
          font-family: 'Sora', sans-serif;
          font-weight: 700;
          font-size: 15px;
          letter-spacing: 0.02em;
          color: var(--ink);
          line-height: 1.15;
        }
        .rf-mark-text span {
          display: block;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          font-size: 10.5px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--accent);
          margin-top: 2px;
        }

        .rf-title {
          font-family: 'Sora', sans-serif;
          font-weight: 700;
          font-size: 24px;
          color: var(--ink);
          margin: 0 0 8px;
          letter-spacing: -0.01em;
        }

        .rf-desc {
          font-size: 14px;
          line-height: 1.55;
          color: var(--sub);
          margin: 0 0 28px;
        }

        .rf-field {
          margin-bottom: 18px;
        }

        .rf-label {
          display: block;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--ink);
          margin-bottom: 7px;
          letter-spacing: 0.01em;
        }

        .rf-input, .rf-select {
          width: 100%;
          border: 1.5px solid var(--line);
          background: var(--field-bg);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          border-radius: 12px;
          padding: 13px 15px;
          font-size: 14.5px;
          font-family: 'Inter', sans-serif;
          color: var(--ink);
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
          appearance: none;
          -webkit-appearance: none;
          box-shadow: inset 0 1px 2px rgba(15, 46, 34, 0.04);
        }

        .rf-input::placeholder { color: #6b7d75; }

        .rf-input:focus, .rf-select:focus {
          border-color: var(--line-focus);
          background: rgba(255, 255, 255, 0.7);
          box-shadow: 0 0 0 4px rgba(63, 140, 110, 0.16);
        }

        .rf-field.has-error .rf-input,
        .rf-field.has-error .rf-select {
          border-color: var(--error);
          background: rgba(253, 244, 244, 0.6);
        }

        .rf-select-wrap {
          position: relative;
        }

        .rf-select-wrap::after {
          content: "";
          position: absolute;
          right: 16px;
          top: 50%;
          width: 9px;
          height: 9px;
          border-right: 2px solid var(--sub);
          border-bottom: 2px solid var(--sub);
          transform: translateY(-65%) rotate(45deg);
          pointer-events: none;
        }

        .rf-select {
          cursor: pointer;
          color: var(--ink);
        }
        .rf-select:invalid { color: #93a6a0; }

        .rf-error {
          margin-top: 6px;
          font-size: 12px;
          color: var(--error);
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .rf-submit {
          position: relative;
          width: 100%;
          margin-top: 10px;
          padding: 14px 18px;
          border: 1px solid rgba(255, 255, 255, 0.35);
          border-radius: 12px;
          background: linear-gradient(135deg, var(--accent), var(--accent-dark));
          color: #ffffff;
          font-family: 'Sora', sans-serif;
          font-weight: 600;
          font-size: 15px;
          letter-spacing: 0.01em;
          cursor: pointer;
          box-shadow:
            0 12px 26px -8px rgba(20, 98, 69, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.35);
          transition: transform 0.12s ease, box-shadow 0.12s ease, filter 0.12s ease;
          overflow: hidden;
        }
        .rf-submit:hover { filter: brightness(1.06); transform: translateY(-1px); }
        .rf-submit:active { transform: translateY(0); box-shadow: 0 6px 16px -8px rgba(20, 98, 69, 0.5); }

        .rf-fineprint {
          text-align: center;
          font-size: 11.5px;
          color: #5c6e66;
          margin-top: 18px;
        }

        .rf-success {
          text-align: center;
          padding: 12px 4px 4px;
        }
        .rf-success-icon {
          width: 62px;
          height: 62px;
          margin: 0 auto 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--hex-a), var(--hex-b));
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .rf-success h2 {
          font-family: 'Sora', sans-serif;
          font-size: 21px;
          color: var(--ink);
          margin: 0 0 8px;
        }
        .rf-success p {
          font-size: 14px;
          color: var(--sub);
          line-height: 1.6;
          margin: 0 0 26px;
        }
        .rf-summary {
          text-align: left;
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          border: 1px solid var(--line);
          border-radius: 12px;
          padding: 16px 18px;
          margin-bottom: 24px;
        }
        .rf-summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 13.5px;
          padding: 6px 0;
          border-bottom: 1px solid var(--line);
        }
        .rf-summary-row:last-child { border-bottom: none; }
        .rf-summary-row span:first-child { color: var(--sub); }
        .rf-summary-row span:last-child { color: var(--ink); font-weight: 500; }

        .rf-again {
          width: 100%;
          padding: 13px 18px;
          border: 1.5px solid var(--line);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.45);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          color: var(--ink);
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: border-color 0.15s ease, background 0.15s ease;
        }
        .rf-again:hover { border-color: var(--line-focus); background: rgba(255, 255, 255, 0.65); }

        @media (max-width: 400px) {
          .rf-card { padding: 34px 24px 30px; border-radius: 18px; }
          .rf-title { font-size: 21px; }
        }
      `}</style>

      <div className="rf-glow rf-glow-1" />
      <div className="rf-glow rf-glow-2" />
      <div className="rf-hex rf-hex-1" />
      <div className="rf-hex rf-hex-2" />
      <div className="rf-hex rf-hex-3" />
      <div className="rf-hex rf-hex-4" />

      <div className="rf-card">
        <svg className="rf-lines" viewBox="0 0 220 400" fill="none">
          {Array.from({ length: 9 }).map((_, i) => (
            <path
              key={i}
              d={`M ${220 - i * 12} -20 C ${140 - i * 10} 120, ${
                170 - i * 8
              } 280, ${60 - i * 6} 420`}
              stroke="url(#rfLineGrad)"
              strokeWidth="1"
            />
          ))}
          <defs>
            <linearGradient id="rfLineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#57c48a" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#4f9d80" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        <div className="rf-mark">
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
            <polygon
              points="17,1.5 30,9 30,25 17,32.5 4,25 4,9"
              fill="url(#markGrad)"
            />
            <path
              d="M11 17.2l4 4 8.5-8.9"
              stroke="#ffffff"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <defs>
              <linearGradient id="markGrad" x1="4" y1="1.5" x2="30" y2="32.5">
                <stop offset="0%" stopColor="#6fd39a" />
                <stop offset="100%" stopColor="#1f8a5b" />
              </linearGradient>
            </defs>
          </svg>
          <div className="rf-mark-text">
            Verafide
            <span>Identity Onboarding</span>
          </div>
        </div>

        {!submitted ? (
          <>
            <h1 className="rf-title">Complete your details</h1>
            <p className="rf-desc">
              We need a few details to set up your account. This takes less than
              a minute.
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <div
                className={`rf-field ${
                  touched.name && errors.name ? "has-error" : ""
                }`}
              >
                <label className="rf-label" htmlFor="rf-name">
                  Full Name
                </label>
                <input
                  id="rf-name"
                  className="rf-input"
                  type="text"
                  placeholder="Enter your full name"
                  value={values.name}
                  onChange={handleChange("name")}
                  onBlur={handleBlur("name")}
                />
                {touched.name && errors.name && (
                  <div className="rf-error">{errors.name}</div>
                )}
              </div>

              <div
                className={`rf-field ${
                  touched.email && errors.email ? "has-error" : ""
                }`}
              >
                <label className="rf-label" htmlFor="rf-email">
                  Email Address
                </label>
                <input
                  id="rf-email"
                  className="rf-input"
                  type="email"
                  placeholder="you@example.com"
                  value={values.email}
                  onChange={handleChange("email")}
                  onBlur={handleBlur("email")}
                />
                {touched.email && errors.email && (
                  <div className="rf-error">{errors.email}</div>
                )}
              </div>

              <div
                className={`rf-field ${
                  touched.dob && errors.dob ? "has-error" : ""
                }`}
              >
                <label className="rf-label" htmlFor="rf-dob">
                  Date of Birth
                </label>
                <input
                  id="rf-dob"
                  className="rf-input"
                  type="date"
                  max={todayStr}
                  value={values.dob}
                  onChange={handleChange("dob")}
                  onBlur={handleBlur("dob")}
                />
                {touched.dob && errors.dob && (
                  <div className="rf-error">{errors.dob}</div>
                )}
              </div>

              <div
                className={`rf-field ${
                  touched.mobile && errors.mobile ? "has-error" : ""
                }`}
              >
                <label className="rf-label" htmlFor="rf-mobile">
                  Mobile Number
                </label>
                <input
                  id="rf-mobile"
                  className="rf-input"
                  type="tel"
                  inputMode="numeric"
                  placeholder="6XXXXXXXXX"
                  value={values.mobile}
                  onChange={handleChange("mobile")}
                  onBlur={handleBlur("mobile")}
                />
                {touched.mobile && errors.mobile && (
                  <div className="rf-error">{errors.mobile}</div>
                )}
              </div>

              <div
                className={`rf-field ${
                  touched.gender && errors.gender ? "has-error" : ""
                }`}
              >
                <label className="rf-label" htmlFor="rf-gender">
                  Gender
                </label>
                <div className="rf-select-wrap">
                  <select
                    id="rf-gender"
                    className="rf-select"
                    value={values.gender}
                    onChange={handleChange("gender")}
                    onBlur={handleBlur("gender")}
                    required
                  >
                    <option value="" disabled>
                      Select gender
                    </option>
                    {GENDERS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                {touched.gender && errors.gender && (
                  <div className="rf-error">{errors.gender}</div>
                )}
              </div>

              <button type="submit" className="rf-submit">
                Submit Details
              </button>
            </form>

            <p className="rf-fineprint">
              Your information is encrypted and never shared.
            </p>
          </>
        ) : (
          <div className="rf-success">
            <div className="rf-success-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12.5l4.5 4.5L19 7.5"
                  stroke="#ffffff"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2>You're all set</h2>
            <p>
              Thanks, {values.name.trim().split(" ")[0]}. Your details have been
              recorded.
            </p>

            <div className="rf-summary">
              <div className="rf-summary-row">
                <span>Name</span>
                <span>{values.name}</span>
              </div>
              <div className="rf-summary-row">
                <span>Email</span>
                <span>{values.email}</span>
              </div>
              <div className="rf-summary-row">
                <span>Date of Birth</span>
                <span>{values.dob}</span>
              </div>
              <div className="rf-summary-row">
                <span>Mobile</span>
                <span>{values.mobile}</span>
              </div>
              <div className="rf-summary-row">
                <span>Gender</span>
                <span>{values.gender}</span>
              </div>
            </div>

            <button className="rf-again" onClick={handleReset}>
              Submit another response
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
