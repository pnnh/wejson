import { PSFileModel } from "@/components/common/models/file";
import { css } from "@/gen/styled/css";
import { PLSelectResult } from "@pnnh/atom";

export async function PSHomeBody({}: {
  lang: string;
  searchParams: Record<string, string>;
  selectResult: PLSelectResult<PSFileModel>;
}) {
  return (
    <div className={resStyles.resBodyComponent}>
      <div className={resStyles.resGrid}></div>
    </div>
  );
}

const resStyles = {
  resBodyComponent: css`
    width: 100%;
    max-width: 80rem;
    margin: 0 auto;
    padding: 1.5rem 1rem 2rem;
    @media screen and (min-width: 48rem) {
      padding: 2rem 1.5rem;
    }
    @media screen and (min-width: 80rem) {
      padding: 2rem;
    }
  `,
  resGrid: css`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.875rem;
    width: 100%;
    margin-bottom: 1rem;
    @media screen and (min-width: 48rem) {
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }
    @media screen and (min-width: 80rem) {
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;
    }
  `,
  resCard: css`
    background-color: var(--background-color);
    border-radius: 12px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
    position: relative;
    overflow: hidden;
    transition:
      box-shadow 0.25s ease,
      transform 0.25s ease;
  `,
};
