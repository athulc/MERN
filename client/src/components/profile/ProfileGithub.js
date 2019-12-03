import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Spinner from "../layout/Spinner";
import { getGithubRepos } from "../../actions/profile";

const ProfileGithub = ({ username, getGithubRepos, repos }) => {
  useEffect(() => {
    getGithubRepos(username);
  }, [getGithubRepos, username]);
  return (
    <div className="profile-github">
      <h2 className="text-primary my-1">Github Repos</h2>
      {repos === null ? (
        <Spinner />
      ) : (
        repos.map(rep => (
          <div key={rep._id} className="repo bg-white my-1 p-1">
            <div>
              <h4>
                <a
                  href={rep.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {rep.name}
                </a>
              </h4>
              <p>{rep.description}</p>
            </div>
            <div>
              <ul>
                <li className="badge badge-primary">
                  Stars: {rep.stargazers_count}
                </li>
                <li className="badge badge-dark">
                  Watchers: {rep.watchers_count}
                </li>
                <li className="badge badge-light">Forks: {rep.forks_count}</li>
              </ul>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

ProfileGithub.propTypes = {
  getGithubRepos: PropTypes.func.isRequired,
  repos: PropTypes.array.isRequired,
  username: PropTypes.string.isRequired
};

const mapStateToProps = state => ({
  repos: state.profile.repos
});

export default connect(mapStateToProps, { getGithubRepos })(ProfileGithub);
