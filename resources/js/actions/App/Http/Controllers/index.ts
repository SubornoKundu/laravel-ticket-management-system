import HomeController from './HomeController'
import DashboardController from './DashboardController'
import Settings from './Settings'
import Admin from './Admin'
import TicketController from './TicketController'
const Controllers = {
    HomeController: Object.assign(HomeController, HomeController),
DashboardController: Object.assign(DashboardController, DashboardController),
Settings: Object.assign(Settings, Settings),
Admin: Object.assign(Admin, Admin),
TicketController: Object.assign(TicketController, TicketController),
}

export default Controllers