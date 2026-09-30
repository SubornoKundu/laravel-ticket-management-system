import TicketController from './TicketController'
import AdminController from './AdminController'
const Admin = {
    TicketController: Object.assign(TicketController, TicketController),
AdminController: Object.assign(AdminController, AdminController),
}

export default Admin