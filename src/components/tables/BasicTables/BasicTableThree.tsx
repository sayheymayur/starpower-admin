import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";

interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  stock: number;
  status: string;
}

const tableData: Product[] = [
  {
    id: 1,
    name: "Apple MacBook Pro",
    category: "Laptops",
    price: "$2,499",
    stock: 12,
    status: "In Stock",
  },
  {
    id: 2,
    name: "Samsung Galaxy S21",
    category: "Smartphones",
    price: "$799",
    stock: 0,
    status: "Out of Stock",
  },
  {
    id: 3,
    name: "Sony WH-1000XM4",
    category: "Headphones",
    price: "$349",
    stock: 34,
    status: "In Stock",
  },
  {
    id: 4,
    name: "Dell XPS 13",
    category: "Laptops",
    price: "$1,199",
    stock: 7,
    status: "In Stock",
  },
  {
    id: 5,
    name: "Apple iPad Pro",
    category: "Tablets",
    price: "$999",
    stock: 0,
    status: "Out of Stock",
  },
];

export default function BasicTableThree() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Product Name
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Category
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Price
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Stock
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Status
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {tableData.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  {product.name}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {product.category}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {product.price}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {product.stock}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {product.status}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
