import React from "react";

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  resetSession = () => {
    window.sessionStorage.clear();
    window.location.assign("/login");
  };

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <main className="centered-page">
        <section className="message-card">
          <p className="eyebrow">Frontend error</p>
          <h1>TransitOps could not render this page.</h1>
          <p>{this.state.error.message || "Clear the session and sign in again."}</p>
          <button className="button" type="button" onClick={this.resetSession}>
            Reset session
          </button>
        </section>
      </main>
    );
  }
}
