import "./PaymentInfo.css"

export default function PaymentInfo({ userInfo, setUserInfo, handleOnCheckout, isCheckingOut, error }) {
  return (
    <div className="PaymentInfo">
      <h3 className="">
        Payment Info{" "}
        <span className="button">
          <i className="material-icons md-48">monetization_on</i>
        </span>
      </h3>
      <div className="input-field">
        <label className="label">Name</label>
        <div className="control ">
          <input
            className="input"
            type="text"
            placeholder="Name"
            value={userInfo.name}
            onChange={(e) => setUserInfo((u) => ({ ...u, name: e.target.value }))}
          />
        </div>
      </div>

      <div className="input-field">
        <label className="label">Email</label>
        <div className="control">
          <input
            className="input"
            type="email"
            placeholder="you@example.com"
            value={userInfo.email}
            onChange={(e) => setUserInfo((u) => ({ ...u, email: e.target.value }))}
          />
        </div>
      </div>

      {error ? <p className="is-danger">{String(error)}</p> : null}

      <div className="field">
        <div className="control">
          <button className="button" disabled={isCheckingOut} onClick={handleOnCheckout}>
            {isCheckingOut ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  )
}
