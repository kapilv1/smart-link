export function getType(url) {
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

export function getSearchEngine(url, type) {
    try {
        const lowerUrl = url.toLowerCase();

        if (type === "greenhouse") {
            if (lowerUrl.includes("embed")) {
                return lowerUrl.match(/[?&]for=([^&]+)/)?.[1] || "";
            }

            return (
                lowerUrl.match(/job-boards\.greenhouse\.io\/([^/]+)/)?.[1] ||
                lowerUrl.match(/job-boards\.eu\.greenhouse\.io\/([^/]+)/)?.[1] ||
                ""
            );
        }

        if (type === "workday") {
            return lowerUrl.match(/https:\/\/(.+?)\.wd/)?.[1] || "";
        }

        if (type === "lever") {
            return lowerUrl.match(/jobs\.lever\.co\/([^/]+)/)?.[1] || "";
        }

        if (type === "ashbyhq") {
            return lowerUrl.match(/jobs\.ashbyhq\.com\/([^/]+)/)?.[1] || "";
        }

        if (type === "rippling") {
            return lowerUrl.match(/ats\.rippling\.com\/([^/]+)/)?.[1] || "";
        }

        if (type === "workable") {
            return (
                lowerUrl.match(/https:\/\/jobs\.workable\.com\/view\/([^/]+)/)?.[1] ||
                lowerUrl.match(/https:\/\/jobs\.workable\.com\/([^/]+)/)?.[1] ||
                ""
            );
        }

        if (type === "dayforcehcm") {
            return lowerUrl.match(/jobs\.dayforcehcm\.com\/en-us\/([^/]+)/)?.[1] || "";
        }

        if (type === "gem") {
            return lowerUrl.match(/jobs\.gem\.com\/([^/]+)/)?.[1] || "";
        }

        if (type === "gusto") {
            return lowerUrl.match(/jobs\.gusto\.com\/postings\/([^/]+)/)?.[1] || "";
        }

        if (type === "jobvite") {
            return lowerUrl.match(/jobs\.jobvite\.com\/([^/]+)/)?.[1] || "";
        }

        if (type === "smartrecruiters") {
            return lowerUrl.match(/jobs\.smartrecruiters\.com\/([^/]+)/)?.[1] || "";
        }

        if (type === "myjobs") {
            return lowerUrl.match(/myjobs\.adp\.com\/([^/]+)/)?.[1] || "";
        }

        if (type === "recruiterflow") {
            return lowerUrl.match(/recruiterflow\.com\/hr\/jobs\/([^/]+)/)?.[1] || "";
        }

        if (type === "paylocity") {
            return (
                lowerUrl.match(/recruiting\.paylocity\.com\/recruiting\/jobs\/details\/([^/]+)/)?.[1] ||
                ""
            );
        }

        if (type === "ultipro") {
            return lowerUrl.match(/ultipro\.com\/([^/]+)/)?.[1] || "";
        }

        if (type === "recruitingbypaycor") {
            return (
                lowerUrl.match(/recruitingbypaycor\.com\/career\/jobintroduction\.action\?(.{10})/)?.[1] ||
                ""
            );
        }

        if (type === "sjobs.brassring") {
            return lowerUrl.match(/home\/homewithpreload\?(.{15})/)?.[1] || "";
        }

        if (type === "workforcenow") {
            return lowerUrl.match(/recruitment\.html\?cid=(.{15})/)?.[1] || "";
        }

        if (type === "adzuna") {
            return lowerUrl.match(/adzuna\.com\/details\/(\d{10})/)?.[1] || "";
        }

        if (type === "careers-page") {
            return lowerUrl.match(/careers-page\.com\/([^/]+)/)?.[1] || "";
        }
        if (type === "recruitingbypaycor") {
            return (
                lowerUrl.match(
                    /recruitingbypaycor\.com\/career\/jobintroduction\.action\?clientid=([^&]{10})/
                )?.[1] || ""
            );
        }
        if (type === "pinterestcareers") {
            return lowerUrl.match(/pinterestcareers\.com\/jobs\/([^/]+)/)?.[1] || "";
        }

        if (type === "jobdiva") {
            return lowerUrl.match(/jobdiva\.com\/portal\/\?a=(.{10})/)?.[1] || "";
        }

        if (type === "otherlinks") {
            return lowerUrl.match(/https:\/\/([^/]+)/)?.[1] || "";
        }

        return "";
    } catch {
        return "";
    }
}