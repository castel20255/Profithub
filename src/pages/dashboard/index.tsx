import { observer } from 'mobx-react-lite';
import { useStore } from '../../hooks/useStore';

const Dashboard = observer(() => {
    const { ui, dashboard } = useStore();
    const { isAuthorized } = ui;
    const handleNormalBot = () => {
        // Assuming Bot Builder tab is index 1
        dashboard.setActiveTab(1);
    };
    const handlePremiumBot = () => {
        // Same tab, could set a flag or route later; using same index for now
        dashboard.setActiveTab(1);
    };
    return (
        <div style={{ paddingTop: '12px' }}>
            <div>Dashboard observing from mobx store.</div>
            <div>isAuthorized: {isAuthorized.toString()}</div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                <button onClick={handleNormalBot}>Normal Bot</button>
                <button onClick={handlePremiumBot}>Premium Bot</button>
            </div>
        </div>
    );
});

export default Dashboard;
