import { Link } from "react-router-dom";

interface BreadCrumbItem {
  title: string;
  path?: string;
}

interface BreadCrumbProps {
  pageTitle: string;
  items?: BreadCrumbItem[];
}

const PageBreadCrumb = ({
  pageTitle,
  items = [],
}: BreadCrumbProps) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">

      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
        {pageTitle}
      </h2>

      <nav>
        <ol className="flex items-center gap-1.5 flex-wrap">

          <li>
            <Link
              to="/"
              className="text-sm text-gray-500 hover:text-brand-500"
            >
              Inicio
            </Link>
          </li>

          {items.map((item, index) => (
            <li
              key={index}
              className="flex items-center gap-1.5"
            >
              <span className="text-gray-400">
                /
              </span>

              {item.path ? (
                <Link
                  to={item.path}
                  className="text-sm text-gray-500 hover:text-brand-500"
                >
                  {item.title}
                </Link>
              ) : (
                <span className="text-sm text-gray-800 dark:text-white">
                  {item.title}
                </span>
              )}
            </li>
          ))}

        </ol>
      </nav>

    </div>
  );
};

export default PageBreadCrumb;