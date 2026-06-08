import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    FaTrash,
    FaCopy,
    FaDownload,
    FaArrowLeft
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import { getLinks, deleteSelectedLinks } from "../services/linkService";

function History({ user, setUser }) {
    const { profileId } = useParams();
    const navigate = useNavigate();

    const [links, setLinks] = useState([]);
    const [selectedDate, setSelectedDate] = useState("All");
    const [searchText, setSearchText] = useState("");
    const [selectedIds, setSelectedIds] = useState([]);
    const [status, setStatus] = useState("");

    useEffect(() => {
        loadLinks();
    }, [profileId]);

    async function loadLinks() {
        try {
            const data = await getLinks(user, profileId);
            setLinks(data);
        } catch (err) {
            setStatus(err.message);
        }
    }

    function getDateLabel(link) {
        const date = new Date(link.updatedAt || link.createdAt);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    }

    const dateButtons = useMemo(() => {
        const dates = [...new Set(links.map((link) => getDateLabel(link)))];
        return ["All", ...dates];
    }, [links]);

    const filteredLinks = useMemo(() => {
        return links.filter((link) => {
            const matchesDate =
                selectedDate === "All" || getDateLabel(link) === selectedDate;

            const search = searchText.toLowerCase();

            const matchesSearch =
                !search ||
                link.url?.toLowerCase().includes(search) ||
                link.type?.toLowerCase().includes(search) ||
                link.searchEngine?.toLowerCase().includes(search);

            return matchesDate && matchesSearch;
        });
    }, [links, selectedDate, searchText]);

    function toggleSelect(id) {
        setSelectedIds((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id]
        );
    }

    function getTargetLinks() {
        if (selectedIds.length > 0) {
            return filteredLinks.filter((link) => selectedIds.includes(link._id));
        }

        return filteredLinks;
    }

    async function copyLinks() {
        const targetLinks = getTargetLinks();

        if (targetLinks.length === 0) {
            setStatus("No links to copy.");
            return;
        }

        await navigator.clipboard.writeText(
            targetLinks.map((link) => link.url).join("\n")
        );

        setStatus(`${targetLinks.length} links copied.`);
    }

    function downloadCSV() {
        const targetLinks = getTargetLinks();

        if (targetLinks.length === 0) {
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

        const rows = targetLinks.map((link) => {
            const date = new Date(link.updatedAt || link.createdAt);

            return [
                date.toLocaleString("default", { month: "long" }),
                date.toLocaleDateString(),
                link.url,
                link.type,
                link.searchEngine,
            ];
        });

        const csv = [
            headers.join(","),
            ...rows.map((row) =>
                row
                    .map((value) => `"${String(value || "").replaceAll('"', '""')}"`)
                    .join(",")
            ),
        ].join("\n");

        const blob = new Blob([csv], {
            type: "text/csv;charset=utf-8;",
        });

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "profile_history_links.csv";
        a.click();

        URL.revokeObjectURL(url);

        setStatus("CSV downloaded.");
    }

    async function deleteLinks() {
        if (selectedIds.length === 0) {
            setStatus("Please select links to delete.");
            return;
        }

        const ok = window.confirm("Delete selected links?");
        if (!ok) return;

        const secondOk = window.confirm("This cannot be undone. Continue?");
        if (!secondOk) return;

        try {
            const data = await deleteSelectedLinks(user, profileId, selectedIds);

            setSelectedIds([]);
            await loadLinks();

            setStatus(`${data.deletedCount} links deleted.`);
        } catch (err) {
            setStatus(err.message);
        }
    }

    return (
        <div className="app">
            <Navbar user={user} setUser={setUser} />

            <h1>Link History</h1>

            <div className="history-top">
                <button onClick={() => navigate("/home")}>
                    <FaArrowLeft /> Back
                </button>

                <input
                    className="history-search"
                    type="text"
                    placeholder="Search links..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
            </div>

            <div className="date-nav">
                {dateButtons.map((date) => (
                    <button
                        key={date}
                        onClick={() => {
                            setSelectedDate(date);
                            setSelectedIds([]);
                        }}
                        className={selectedDate === date ? "active-date" : ""}
                    >
                        {date}
                    </button>
                ))}
            </div>

            <div className="history-list">
                {filteredLinks.map((link, index) => (
                    <div key={link._id} className="history-row">
                        <span className="history-number">{index + 1}</span>

                        <div className="history-info">
                            <p>{link.url}</p>
                            <small>
                                {link.type} | {link.searchEngine}
                            </small>
                        </div>

                        <input
                            type="checkbox"
                            checked={selectedIds.includes(link._id)}
                            onChange={() => toggleSelect(link._id)}
                        />
                    </div>
                ))}
            </div>

            <div className="history-bottom">
                <span>
                    Links: {filteredLinks.length} | Selected: {selectedIds.length}
                </span>

                <button onClick={deleteLinks}>
                    <FaTrash /> Delete
                </button>

                <button onClick={copyLinks}>
                    <FaCopy /> Copy
                </button>

                <button onClick={downloadCSV}>
                    <FaDownload /> Download CSV
                </button>
            </div>

            <p className="status">{status}</p>
        </div>
    );
}

export default History;