import { useEffect, useState } from "react";
import "./Home.css";
import ReactPaginate from "react-paginate";
import { useNavigate } from "react-router-dom";

const perPage = 10;
const USER_KEY = "GITHUB_USERS_ID";

const phoneNumber = window.localStorage.getItem(USER_KEY);

export default function Home() {
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const user = window.localStorage.getItem(USER_KEY);

    if (!user) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    async function fetchFavorites() {
      const response = await fetch(
        `http://localhost:3000/api/get-user-profile?phoneNumber=${encodeURIComponent(
          phoneNumber
        )}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFavorites(data.favorite_github_users);
      }
    }

    fetchFavorites();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    const response = await fetch(
      `http://localhost:3000/api/search-github-users?q=${term}&page=1&per_page=${perPage}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (response.ok) {
      const data = await response.json();
      setTotal(data.total_count);
      setUsers(data.items);
    }
  }

  async function handleChangePage(e) {
    const response = await fetch(
      `http://localhost:3000/api/search-github-users?q=${term}&page=${
        e.selected + 1
      }&per_page=${perPage}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (response.ok) {
      const data = await response.json();
      setUsers(data.items);
    }
  }

  async function handleLikeProfile(id) {
    const response = await fetch("http://localhost:3000/api/like-github-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phoneNumber: phoneNumber,
        userId: id,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      setFavorites(data.split(","));
    }
  }

  const userList = users.map((u) => (
    <tr key={u.id}>
      <td>
        <button className="LikeBtn" onClick={() => handleLikeProfile(u.id)}>
          {favorites.includes(u.id.toString()) ? "💖" : "🤍"}
        </button>
      </td>
      <td>{u.id}</td>
      <td>{u.login}</td>
      <td>{u.avatar_url}</td>
      <td>{u.html_url}</td>
      <td>{u.repos_url}</td>
      <td>{u.followers_url}</td>
    </tr>
  ));

  const pageCount = Math.ceil(total / perPage);

  return (
    <>
      <div>
        <form onSubmit={handleSubmit}>
          <label htmlFor="search">Enter to search:</label>
          <input
            id="search"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
          <input type="submit" value="Search" disabled={term.length === 0} />
        </form>
      </div>
      <div className="Total">Total: {total}</div>
      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>id</th>
              <th>login</th>
              <th>avatar_url</th>
              <th>html_url</th>
              <th>public_repos</th>
              <th>followers</th>
            </tr>
          </thead>
          <tbody>{userList}</tbody>
        </table>
      </div>

      <div className="Pagination">
        <ReactPaginate
          breakLabel="..."
          nextLabel="next >"
          onPageChange={handleChangePage}
          pageRangeDisplayed={5}
          pageCount={pageCount}
          previousLabel="< previous"
          renderOnZeroPageCount={null}
          pageClassName="page-item"
          pageLinkClassName="page-link"
          previousClassName="page-item"
          previousLinkClassName="page-link"
          nextClassName="page-item"
          nextLinkClassName="page-link"
          breakClassName="page-item"
          breakLinkClassName="page-link"
          containerClassName="pagination"
          activeClassName="active"
        />
      </div>
    </>
  );
}
