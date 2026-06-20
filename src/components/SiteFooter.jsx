import Icon from "./Icon";

const GITHUB_URL = "https://github.com/shariful-prog";

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <p className="site-footer-made">
          Made with <span className="site-footer-heart" aria-hidden="true">♥</span> by Shariful Islam
        </p>

        <div className="site-footer-end">
          <a
            href={GITHUB_URL}
            className="site-footer-social"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
          >
            <Icon name="github" size={18} />
            GitHub
          </a>
          <span className="site-footer-copy">&copy; {year} CertBuddy</span>
        </div>
      </div>
    </footer>
  );
}
