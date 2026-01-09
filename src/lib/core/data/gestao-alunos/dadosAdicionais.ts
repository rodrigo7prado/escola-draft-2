export type DataConclusao = {
  curso: string;
  anoLetivo: number;
  periodoLetivo: number;
  dataConclusao: Date;
};

const datasDeConclusao: DataConclusao[] = [
  {
    curso: "EMR",
    anoLetivo: 2024,
    periodoLetivo: 0,
    dataConclusao: new Date("2024-12-19"),
  },
  {
    curso: "EMR",
    anoLetivo: 2024,
    periodoLetivo: 0,
    dataConclusao: new Date("2024-12-20"),
  },
  {
    curso: "EMR",
    anoLetivo: 2024,
    periodoLetivo: 0,
    dataConclusao: new Date("2024-12-19"),
  },
];

export const dataDeConclusao: Record<string, Date | null> = {
  EMR: datasDeConclusao.find((item) => item.curso === "EMR")?.dataConclusao ?? null,
};
