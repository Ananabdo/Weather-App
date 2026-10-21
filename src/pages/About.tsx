export default function About() {
  return (
    <main className="page">
      <h1 className="title">About SkyCast</h1>
      <p className="subtitle">A simple way to check the weather anywhere in Israel.</p>

      <div className="card">
        <h2>About the Site</h2>
        <p>
          SkyCast shows the current weather for any locality in Israel. The list of localities
          is loaded live from the Israeli government's open data portal (data.gov.il), and the
          weather comes from WeatherAPI.com.
        </p>
        <ul className="features">
          <li><strong>Home</strong> – pick a locality and instantly see its temperature, conditions and wind speed.</li>
          <li><strong>History</strong> – a table of every search you made, with the exact date and time.</li>
          <li><strong>About</strong> – information about the site and its developer.</li>
        </ul>
        <p className="tech">Built with React, TypeScript and Vite.</p>
      </div>

      <div className="card developer">
        <div className="avatar">AA</div>
        <div>
          <span className="label">Developed by</span>
          <h2>Anan Abdo</h2>
          <p>Student · Web Development Project</p>
        </div>
      </div>
    </main>
  );
}
