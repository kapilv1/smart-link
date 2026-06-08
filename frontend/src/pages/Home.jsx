import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import ProfileSection from "../components/ProfileSection";
import LinkFilterSection from "../components/LinkFilterSection";
import { useNavigate } from "react-router-dom";
import { getProfiles, createProfile } from "../services/profileService";
import {
    getLinks,
    saveProfileLinks,
    deleteAllProfileLinks,
} from "../services/linkService";

import { getType, getSearchEngine } from "../utils/linkParser";

function Home({ user, setUser }) {
    const navigate = useNavigate();
    const [profiles, setProfiles] = useState([]);
    const [links, setLinks] = useState([]);
    const [selectedProfile, setSelectedProfile] = useState("");

    const [newLinksText, setNewLinksText] = useState("");
    const [unavailableLinksText, setUnavailableLinksText] = useState("");

    const [validLinks, setValidLinks] = useState([]);

    const [status, setStatus] = useState("");

    useEffect(() => {
        loadProfiles();
    }, []);
    function openHistory() {
        if (!selectedProfile) {
            setStatus("Please select profile first.");
            return;
        }

        navigate(`/history/${selectedProfile}`);
    }
    useEffect(() => {
        if (selectedProfile) {
            loadLinks(selectedProfile);

            setNewLinksText("");
            setUnavailableLinksText("");
            setValidLinks([]);
        }
    }, [selectedProfile]);

    async function loadProfiles() {
        try {
            const data = await getProfiles(user);

            setProfiles(data);

            if (data.length > 0) {
                setSelectedProfile(data[0]._id);
            }
        } catch (err) {
            setStatus(err.message);
        }
    }

    async function loadLinks(profileId) {
        try {
            const data = await getLinks(user, profileId);
            setLinks(data);
        } catch (err) {
            setStatus(err.message);
        }
    }

    async function addProfile() {
        const name = prompt("Enter profile name:");

        if (!name?.trim()) return;

        try {
            const data = await createProfile(user, name);

            setProfiles([data, ...profiles]);
            setSelectedProfile(data._id);

            setStatus("Profile created.");
        } catch (err) {
            setStatus(err.message);
        }
    }
    function downloadLinks() {
        if (!selectedProfile) {
            setStatus("Please select profile first.");
            return;
        }

        if (links.length === 0) {
            setStatus("No links to download.");
            return;
        }

        const headers = [
            "month_updated",
            "date_updated",
            "link",
            "group",
            "search_engine",
        ];

        const rows = links.map((link) => {
            const updatedDate = new Date(link.updatedAt || link.createdAt);

            const month = updatedDate.toLocaleString("default", {
                month: "long",
            });

            const date = updatedDate.toLocaleDateString();

            return [
                month,
                date,
                link.url,
                link.type,
                link.searchEngine,
            ];
        });

        const csvContent = [
            headers.join(","),
            ...rows.map((row) =>
                row
                    .map((value) => `"${String(value || "").replaceAll('"', '""')}"`)
                    .join(",")
            ),
        ].join("\n");

        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
        });

        const selectedProfileName =
            profiles.find((profile) => profile._id === selectedProfile)?.name ||
            "profile";

        const fileName = `${selectedProfileName.replaceAll(" ", "_")}_links.csv`;

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();

        URL.revokeObjectURL(url);

        setStatus("CSV downloaded successfully.");
    }

    async function deleteAllLinks() {
        if (!selectedProfile) {
            setStatus("Please select profile first.");
            return;
        }

        const ok = window.confirm(
            "Are you sure you want to delete all links from this selected profile?"
        );

        if (!ok) return;

        const secondOk = window.confirm(
            "This cannot be undone. Delete all links now?"
        );

        if (!secondOk) return;

        try {
            const data = await deleteAllProfileLinks(user, selectedProfile);

            setLinks([]);
            setValidLinks([]);
            setNewLinksText("");
            setUnavailableLinksText("");

            setStatus(`${data.deletedCount} links deleted successfully.`);
        } catch (err) {
            setStatus(err.message);
        }
    } function filterLinks() {
        if (!selectedProfile) {
            setStatus("Please select profile first.");
            return;
        }

        const lines = newLinksText
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean);

        const uniqueUrls = [...new Set(lines)];

        const unavailable = [];
        const valid = [];
        const newLinkKeys = new Set();

        uniqueUrls.forEach((url) => {
            if (!url.startsWith("http")) {
                unavailable.push({
                    url,
                    type: "",
                    searchEngine: "",
                });
                return;
            }

            let type = getType(url);
            let searchEngine = getSearchEngine(url, type);

            if (!searchEngine) {
                type = "invalid";
                searchEngine = url.slice(0, 40);
            }

            const key = `${type}_${searchEngine}`;

            const existsInDatabase = links.some(
                (item) => item.type === type && item.searchEngine === searchEngine
            );

            const existsInCurrentList = newLinkKeys.has(key);

            const parsedLink = {
                url,
                type,
                searchEngine,
            };

            if (existsInDatabase || existsInCurrentList) {
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
            `${uniqueUrls.length} links checked | ${unavailable.length} unavailable | ${valid.length} ready to save`
        );
    }
    async function saveLinks() {
        if (validLinks.length === 0) {
            setStatus("No valid links to save.");
            return;
        }

        try {
            const data = await saveProfileLinks(
                user,
                selectedProfile,
                validLinks
            );

            await loadLinks(selectedProfile);

            setValidLinks([]);
            setNewLinksText("");

            setStatus(
                `${data.savedCount} links saved successfully.`
            );
        } catch (err) {
            setStatus(err.message);
        }
    }
    async function copyLinks() {
        if (!newLinksText.trim()) {
            setStatus("No links to copy.");
            return;
        }

        await navigator.clipboard.writeText(newLinksText);

        setStatus("Links copied.");
    }
    return (
        <div className="app">
            <Navbar user={user} setUser={setUser} />

            <h1>Smart Link Filter</h1>

            <ProfileSection
                profiles={profiles}
                selectedProfile={selectedProfile}
                setSelectedProfile={setSelectedProfile}
                addProfile={addProfile}
                openHistory={openHistory}
            />
            <LinkFilterSection
                newLinksText={newLinksText}
                setNewLinksText={setNewLinksText}
                unavailableLinksText={unavailableLinksText}
                setUnavailableLinksText={setUnavailableLinksText}
                filterLinks={filterLinks}
                copyLinks={copyLinks}
                saveLinks={saveLinks}
                downloadLinks={downloadLinks}
                deleteAllLinks={deleteAllLinks}
            />

            <p className="status">{status}</p>
        </div>
    );
}

export default Home;