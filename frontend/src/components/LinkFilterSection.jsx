import {
    FaCopy,
    FaSave,
    FaDownload,
    FaTrash
} from "react-icons/fa";

function LinkFilterSection({
    newLinksText,
    setNewLinksText,
    unavailableLinksText,
    setUnavailableLinksText,
    filterLinks,
    copyLinks,
    saveLinks,
    downloadLinks,
    deleteAllLinks,
}) {
    const newLinksCount = newLinksText
        .split("\n")
        .filter((x) => x.trim()).length;

    const unavailableLinksCount = unavailableLinksText
        .split("\n")
        .filter((x) => x.trim()).length;

    return (
        <>
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

                    <div className="links-count">
                        Total Links: {unavailableLinksCount}
                    </div>
                </div>
            </div>

            <div className="button-section">
                <button onClick={copyLinks}>
                    <FaCopy /> Copy Links
                </button>

                <button onClick={saveLinks}>
                    <FaSave /> Save
                </button>

                <button onClick={downloadLinks}>
                    <FaDownload /> Download CSV
                </button>

                <button onClick={deleteAllLinks}>
                    <FaTrash /> Delete All
                </button>
            </div>
        </>
    );
}

export default LinkFilterSection;