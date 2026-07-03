import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import UserCreate from "./modules/user/pages/UserCreate";
import UserDeleted from "./modules/user/pages/UserDeleted";
import UserEdit from "./modules/user/pages/UserEdit";
import UserList from "./modules/user/pages/UserList";
import { razaRoutes } from "./modules/razas/routes";
import { categoriaAnimalRoutes } from "./modules/categorias-animales/routes";
import { vacunaRoutes } from "./modules/vacunas/routes";


export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>

          {/* Dashboard protegido */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >

            <Route index element={<Home />} />
            <Route path="/usuarios" element={<UserList />}/>
            <Route path="/usuarios/crear" element={<UserCreate />} />
            <Route path="/usuarios/eliminados" element={<UserDeleted />} />
            <Route path="/usuarios/:id/editar" element={<UserEdit />} />
            {razaRoutes}
            {categoriaAnimalRoutes}
            {vacunaRoutes}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />

            <Route path="/form-elements" element={<FormElements />} />

            <Route path="/basic-tables" element={<BasicTables />} />

            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />

          </Route>

          {/* Auth */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </Router>
    </>
  );
}
