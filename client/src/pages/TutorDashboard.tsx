import { IFToggleSidebar } from "../app";
import MainDashboard from "../layouts/MainDashboard";
import CardList from "../components/Tutor/dashboard/CardList";
import EnrollGraph from "../components/Tutor/dashboard/EnrollGraph";
import StatementTable from "../components/Tutor/dashboard/StatementTable";

export default function TutorDashboard({ toggleSidebar, setToggleSidebar }:IFToggleSidebar) {
    return (
        <MainDashboard
            title="Tutor Dashboard"
            toggleSidebar={toggleSidebar}
            setToggleSidebar={setToggleSidebar}
            order={0}
        >
            <CardList />
            <EnrollGraph />
            <StatementTable />
        </MainDashboard>
    );
}