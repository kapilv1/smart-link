import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "https://smart-link-915g7xyxg-kapilv1s-projects.vercel.app";

function getType(url) {
  const lowerUrl = url.toLowerCase();

  if (lowerUrl.includes("greenhouse")) return "greenhouse";
  if (lowerUrl.includes("workday")) return "workday";
  if (lowerUrl.includes("lever")) return "lever";
  if (lowerUrl.includes("ashbyhq")) return "ashbyhq";
  if (lowerUrl.includes("rippling")) return "rippling";
  if (lowerUrl.includes("workable")) return "workable";
  if (lowerUrl.includes("dayforcehcm")) return "dayforcehcm";
  if (lowerUrl.includes("jobs.gem.com")) return "gem";
  if (lowerUrl.includes("gusto")) return "gusto";
  if (lowerUrl.includes("jobs.jobvite.com")) return "jobvite";
  if (lowerUrl.includes("smartrecruiters")) return "smartrecruiters";
  if (lowerUrl.includes("myjobs.adp.com")) return "myjobs";
  if (lowerUrl.includes("recruiterflow")) return "recruiterflow";
  if (lowerUrl.includes("paylocity")) return "paylocity";
  if (lowerUrl.includes("ultipro")) return "ultipro";
  if (lowerUrl.includes("recruitingbypaycor")) return "recruitingbypaycor";
  if (lowerUrl.includes("sjobs.brassring")) return "sjobs.brassring";
  if (lowerUrl.includes("workforcenow")) return "workforcenow";
  if (lowerUrl.includes("adzuna")) return "adzuna";
  if (lowerUrl.includes("careers-page")) return "careers-page";
  if (lowerUrl.includes("paycomonline")) return "paycomonline";
  if (lowerUrl.includes("pinterestcareers")) return "pinterestcareers";
  if (lowerUrl.includes("jobdiva")) return "jobdiva";

  return "otherlinks";
}

function getSearchEngine(url, type) {
  try {
    const lowerUrl = url.toLowerCase();

    if (type === "greenhouse") {
      if (lowerUrl.includes("embed")) {
        const match = lowerUrl.match(/[?&]for=([^&]+)/);
        return match ? match[1] : "";
      }

      let match = lowerUrl.match(/job-boards\.greenhouse\.io\/([^/]+)/);
      if (match) return match[1];

      match = lowerUrl.match(/job-boards\.eu\.greenhouse\.io\/([^/]+)/);
      return match ? match[1] : "";
    }

    if (type === "workday") {
      const match = lowerUrl.match(/https:\/\/(.+?)\/wd/);
      return match ? match[1] : "";
    }

    if (type === "lever") {
      const match = lowerUrl.match(/jobs\.lever\.co\/([^/]+)/);
      return match ? match[1] : "";
    }

    if (type === "ashbyhq") {
      const match = lowerUrl.match(/jobs\.ashbyhq\.com\/([^/]+)/);
      return match ? match[1] : "";
    }

    if (type === "rippling" || type === "pinterestcareers") {
      const match = lowerUrl.match(/ats\.rippling\.com\/([^/]+)/);
      return match ? match[1] : "";
    }

    if (type === "workable") {
      let match = lowerUrl.match(/apply\.workable\.com\/view\/([^/]+)/);
      if (match) return match[1];

      match = lowerUrl.match(/apply\.workable\.com\/([^/]+)/);
      return match ? match[1] : "";
    }

    if (type === "dayforcehcm") {
      const match = lowerUrl.match(/jobs\.dayforcehcm\.com\/en-us\/([^/]+)/);
      return match ? match[1] : "";
    }

    if (type === "gem") return lowerUrl.match(/jobs\.gem\.com\/([^/]+)/)?.[1] || "";
    if (type === "gusto") return lowerUrl.match(/jobs\.gusto\.com\/postings\/([^/]+)/)?.[1] || "";
    if (type === "jobvite") return lowerUrl.match(/jobs\.jobvite\.com\/([^/]+)/)?.[1] || "";
    if (type === "smartrecruiters") return lowerUrl.match(/jobs\.smartrecruiters\.com\/([^/]+)/)?.[1] || "";
    if (type === "myjobs") return lowerUrl.match(/myjobs\.adp\.com\/([^/]+)/)?.[1] || "";
    if (type === "recruiterflow") return lowerUrl.match(/recruiterflow\.com\/hr\/jobs\/([^/]+)/)?.[1] || "";
    if (type === "paylocity") return lowerUrl.match(/recruiting\.paylocity\.com\/recruiting\/jobs\/details\/([^/]+)/)?.[1] || "";
    if (type === "ultipro") return lowerUrl.match(/ultipro\.com\/([^/]+)/)?.[1] || "";
    if (type === "recruitingbypaycor") return lowerUrl.match(/recruitingbypaycor\.com\/career\/jobintroduction\.action\?(.{10})/)?.[1] || "";
    if (type === "sjobs.brassring") return lowerUrl.match(/home\/homewithpreload\?(.{15})/)?.[1] || "";
    if (type === "workforcenow") return lowerUrl.match(/recruitment\.html\?cid=(.{15})/)?.[1] || "";
    if (type === "adzuna") return lowerUrl.match(/adzuna\.com\/details\/(\d{10})/)?.[1] || "";
    if (type === "careers-page") return lowerUrl.match(/careers-page\.com\/([^/]+)/)?.[1] || "";
    if (type === "paycomonline") return lowerUrl.match(/v4\/ats\/web\.php\/portal\/(.{15})/)?.[1] || "";
    if (type === "jobdiva") return lowerUrl.match(/jobdiva\.com\/portal\/\?a=(.{10})/)?.[1] || "";

    return lowerUrl.match(/https:\/\/([^/]+)/)?.[1] || "";
  } catch {
    return "";
  }
}

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
  const [isSignup, setIsSignup] = useState(false);

  const [authForm, setAuthForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [profiles, setProfiles] = useState([]);
  const [links, setLinks] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState("");

  const [newLinksText, setNewLinksText] = useState("");
  const [unavailableLinksText, setUnavailableLinksText] = useState("");
  const [validLinks, setValidLinks] = useState([]);
  const [status, setStatus] = useState("");

  const authHeaders = {
    "Content-Type": "application/json",
    "x-user-id": user?.id,
  };

  const newLinksCount = newLinksText.split("\n").filter((x) => x.trim()).length;
  const unavailableLinksCount = unavailableLinksText.split("\n").filter((x) => x.trim()).length;

  useEffect(() => {
    if (user) loadProfiles();
  }, [user]);

  useEffect(() => {
    if (selectedProfile) loadLinks(selectedProfile);
  }, [selectedProfile]);

  async function handleAuth(e) {
    e.preventDefault();

    const endpoint = isSignup ? "/auth/signup" : "/auth/login";

    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(authForm),
    });

    const data = await res.json();

    if (!res.ok) {
      setStatus(data.error);
      return;
    }

    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    setStatus("");
  }

  async function loadProfiles() {
    const res = await fetch(`${API_URL}/profiles`, {
      headers: authHeaders,
    });

    const data = await res.json();

    if (!res.ok) {
      setStatus(data.error);
      return;
    }

    setProfiles(data);

    if (data.length > 0) {
      setSelectedProfile(data[0]._id);
    }
  }

  async function loadLinks(profileId) {
    const res = await fetch(`${API_URL}/profiles/${profileId}/links`, {
      headers: authHeaders,
    });

    const data = await res.json();

    if (!res.ok) {
      setStatus(data.error);
      return;
    }

    setLinks(data);
  }
  async function addProfile() {
    const name = prompt("Enter new profile name:");
    if (!name) return;

    const res = await fetch(`${API_URL}/profiles`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ name }),
    });

    const data = await res.json();

    if (!res.ok) {
      setStatus(data.error);
      return;
    }

    setProfiles([data, ...profiles]);
    setSelectedProfile(data._id);
  }

  function filterLinks() {
    if (!selectedProfile) {
      setStatus("Please create or select profile first.");
      return;
    }

    const lines = newLinksText
      .split("\n")
      .map((link) => link.trim())
      .filter(Boolean);

    const uniqueUrls = [...new Set(lines)];

    const unavailable = [];
    const valid = [];
    const invalid = [];
    const newLinkKeys = new Set();

    uniqueUrls.forEach((url) => {
      if (!url.startsWith("http")) {
        invalid.push(url);
        return;
      }

      const type = getType(url);
      const searchEngine = getSearchEngine(url, type);

      if (!searchEngine) {
        invalid.push(url);
        return;
      }

      const key = `${type}_${searchEngine}`;

      const existsInDatabase = links.some(
        (item) =>
          item.type === type &&
          item.searchEngine === searchEngine
      );

      const existsInNewLinks = newLinkKeys.has(key);

      const parsedLink = {
        url,
        type,
        searchEngine,
      };

      if (existsInDatabase || existsInNewLinks) {
        unavailable.push(parsedLink);
      } else {
        valid.push(parsedLink);
        newLinkKeys.add(key);
      }
    });

    setValidLinks(valid);
    setNewLinksText(valid.map((item) => item.url).join("\n"));
    setUnavailableLinksText(unavailable.map((item) => item.url).join("\n"));

    setStatus(
      `${uniqueUrls.length} links checked | ${unavailable.length} unavailable | ${valid.length} ready to save | ${invalid.length} invalid`
    );
  }

  async function saveLinks() {
    if (validLinks.length === 0) {
      setStatus("No valid links to save.");
      return;
    }

    const res = await fetch(`${API_URL}/profiles/${selectedProfile}/links`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ links: validLinks }),
    });

    const data = await res.json();

    if (!res.ok) {
      setStatus(data.error);
      return;
    }

    setValidLinks([]);
    setNewLinksText("");
    await loadLinks(selectedProfile);

    setStatus(`${data.savedCount} links saved successfully.`);
  }

  async function copyLinks() {
    if (!newLinksText.trim()) {
      setStatus("No new links to copy.");
      return;
    }

    await navigator.clipboard.writeText(newLinksText);
    setStatus("New links copied.");
  }

  function logout() {
    localStorage.removeItem("user");
    setUser(null);
    setProfiles([]);
    setLinks([]);
    setSelectedProfile("");
  }

  if (!user) {
    return (
      <div className="auth-page">
        <form className="auth-card" onSubmit={handleAuth}>
          <h1>{isSignup ? "Create Account" : "Login"}</h1>

          <input
            type="text"
            placeholder="Username"
            value={authForm.username}
            onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
          />

          <input
            type="password"
            placeholder="Password"
            value={authForm.password}
            onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
          />

          {isSignup && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={authForm.confirmPassword}
              onChange={(e) =>
                setAuthForm({ ...authForm, confirmPassword: e.target.value })
              }
            />
          )}

          <button type="submit">{isSignup ? "Sign Up" : "Login"}</button>

          <p onClick={() => setIsSignup(!isSignup)} className="auth-switch">
            {isSignup ? "Already have account? Login" : "Need account? Sign Up"}
          </p>

          <p className="status">{status}</p>
        </form>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="top-user">
        <div className="avatar">{user.username.slice(0, 2).toUpperCase()}</div>
        <button onClick={logout}>Logout</button>
      </div>

      <h1>Smart Link Filter</h1>

      <div className="profile-section">
        <label>Profile</label>

        <select
          value={selectedProfile}
          onChange={(e) => setSelectedProfile(e.target.value)}
        >
          {profiles.map((profile) => (
            <option key={profile._id} value={profile._id}>
              {profile.name}
            </option>
          ))}
        </select>

        <button onClick={addProfile}>Add</button>
      </div>

      <div className="main-section">
        <div className="box">
          <h2>new_links</h2>
          <textarea
            value={newLinksText}
            onChange={(e) => setNewLinksText(e.target.value)}
            placeholder="Paste new links here..."
          />
          <div className="links-count">Total Links: {newLinksCount}</div>
        </div>

        <div className="filter-box">
          <button onClick={filterLinks}>Filter</button>
        </div>

        <div className="box">
          <h2>unavailable_links</h2>
          <textarea
            value={unavailableLinksText}
            onChange={(e) => setUnavailableLinksText(e.target.value)}
            placeholder="Unavailable links will show here..."
          />
          <div className="links-count">Total Links: {unavailableLinksCount}</div>
        </div>
      </div>

      <div className="button-section">
        <button onClick={copyLinks}>Copy Links</button>
        <button onClick={saveLinks}>Save</button>
      </div>

      <p className="status">{status}</p>
    </div>
  );
}

export default App;

