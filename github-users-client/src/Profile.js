import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const phoneNumber = window.localStorage.getItem("GITHUB_USERS_ID");

function GithubUser({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchFavorites() {
      const response = await fetch(
        `http://localhost:3000/api/find-github-user-profile?github_user_id=${userId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    }

    fetchFavorites();
  }, [userId]);

  return (
    user && (
      <tr key={user.id}>
        <td>{user.id}</td>
        <td>{user.login}</td>
        <td>{user.avatar_url}</td>
        <td>{user.html_url}</td>
        <td>{user.public_repos}</td>
        <td>{user.followers}</td>
      </tr>
    )
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const user = window.localStorage.getItem("GITHUB_USERS_ID");

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

  return (
    <>
      <h3>Liked Profiles:</h3>
      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>id</th>
              <th>login</th>
              <th>avatar_url</th>
              <th>html_url</th>
              <th>public_repos</th>
              <th>followers</th>
            </tr>
          </thead>
          <tbody>
            {favorites.length > 0 &&
              favorites.map((f) => <GithubUser userId={f} />)}
          </tbody>
        </table>
      </div>
    </>
  );
}
