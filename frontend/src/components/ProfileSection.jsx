import { FaPlus, FaHistory } from "react-icons/fa";

function ProfileSection({
    profiles,
    selectedProfile,
    setSelectedProfile,
    addProfile,
    openHistory,
}) {
    return (
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

            <button onClick={addProfile}>
                <FaPlus /> Add
            </button>

            <button onClick={openHistory}>
                <FaHistory /> History
            </button>
        </div>
    );
}

export default ProfileSection;