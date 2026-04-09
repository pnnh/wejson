import { transTodo } from "@/components/common/locales/normal";
import { getPathname } from "@/components/server/pathname";
import { css } from "@/gen/styled/css";
import { CSSProperties } from "react";

export async function SiteNavMenu({
  lang,
}: {
  lang: string;
  searchParams: Record<string, string>;
}) {
  const pathname = await getPathname();

  return (
    <div className={styles.siteNavMenu}>
      <ArticleNavbar pathname={pathname} lang={lang} />
    </div>
  );
}

function ArticleNavbar({ lang, pathname }: { lang: string; pathname: string }) {
  const homeUrl = `/${lang}`;
  const navLinks = [{ name: transTodo("JSON"), href: homeUrl }];
  return (
    <>
      {navLinks.map((link) => {
        let style: CSSProperties = {};
        if (
          link.href === pathname ||
          (pathname.startsWith(link.href) && link.href !== homeUrl)
        ) {
          style = {
            color: "#4A95DD",
          };
        }
        return (
          <a
            key={link.name}
            className={styles.navLink}
            style={style}
            href={link.href}
          >
            {link.name}
          </a>
        );
      })}
    </>
  );
}

const styles = {
  siteNavMenu: css`
    display: none;
    @media screen and (min-width: 48rem) {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 0.25rem;
    }
  `,
  selectorBox: css`
    border: solid 1px var(--border-color);
    border-radius: 8px;
    background: var(--background-color);
    display: flex;
    flex-direction: column;
    gap: 0;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  `,
  navLink: css`
    color: var(--text-secondary-color);
    text-decoration: none;
    font-size: 0.9rem;
    padding: 4px 10px;
    border-radius: 6px;
    transition:
      color 0.2s ease,
      background-color 0.2s ease;

    &:hover {
      color: var(--text-primary-color);
      background-color: var(--action-hover-color);
    }
  `,
  toolsLink: css`
    text-decoration: none;
    color: var(--text-secondary-color);
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 400;
    padding: 4px 10px;
    border-radius: 6px;
    transition:
      color 0.2s ease,
      background-color 0.2s ease;

    &:hover {
      color: var(--text-primary-color);
      background-color: var(--action-hover-color);
    }
  `,
};
