import Drawer from '@mui/material/Drawer';
import SidenavContent from './SidenavContent';

function SideNav() {
        let type = 'permanent';
        return (
            <div className={`app-sidebar d-none d-xl-flex`}>
                <Drawer
                    className="app-sidebar-content"
                    variant={type}
                    open={true}
                    classes={{
                        paper: 'side-nav'
                    }}>
                    <div className="app-logo mr-2 d-sm-block app-logo-left" style={{ padding: 4 }}>
                        <span className="app-logo-title" style={{ letterSpacing: '2px' }}>
                            ET
                        </span>
                    </div>
                    <SidenavContent />
                </Drawer>
            </div>
        );
}

export default SideNav;
