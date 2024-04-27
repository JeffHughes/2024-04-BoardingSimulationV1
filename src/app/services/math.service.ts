import { Injectable } from '@angular/core';

interface HistogramBin {
  range: string;
  count: number;
}

export interface HistogramIntBin {
  range: number;
  count: number;
}


@Injectable({
  providedIn: 'root'
})
export class MathService {

  generateGaussianNumbers(count: number, median: number, minRange: number, maxRange: number): number[] {
    const numbers = [];

    for (let i = 0; i < count; i++) {
      // Box-Muller transform
      let u = Math.random();
      let v = Math.random();
      let standardNormal = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

      // Scaling the standard normal variable
      let scaledNormal = standardNormal * (maxRange - minRange) / 6 + median;

      // Ensuring the number falls within the specified range
      scaledNormal = Math.max(median + minRange, Math.min(median + maxRange, scaledNormal));

      numbers.push(scaledNormal);
    }

    return numbers;
  }

  generateGaussianNumbersWStdDev(count: number, median: number, minRange: number, maxRange: number): number[] {
    const standardDeviation = (maxRange - minRange) / 6; // Approx. 99.7% data within [minRange, maxRange]
    const numbers = [];

    for (let i = 0; i < count; i++) {
      let rand = 0, num = 0;

      // Use the Box-Muller transform to generate Gaussian numbers
      while (rand === 0) rand = Math.random(); // avoid taking log of 0
      num = Math.cos(2 * Math.PI * Math.random()) * Math.sqrt(-2 * Math.log(rand));

      // Adjust for our median and standard deviation
      num = num * standardDeviation + median;

      // Clamp values to within the minRange and maxRange
      num = Math.max(minRange + median, Math.min(maxRange + median, num));

      numbers.push(num);
    }

    return numbers;
  }

  generateAsymmetricGaussianNumbers(count: number, median: number, minRange: number, maxRange: number): number[] {
    const numbers = [];
    // Define standard deviations for each side
    const leftStdDev = Math.abs(median - (median + minRange)) / 3;
    const rightStdDev = (median + maxRange - median) / 3;

    for (let i = 0; i < count; i++) {
      let num, rand, sideStdDev;

      // Randomly choose which side of the median to generate the number for
      if (Math.random() < 0.5) {
        // Generate number for the left side
        sideStdDev = leftStdDev;
      } else {
        // Generate number for the right side
        sideStdDev = rightStdDev;
      }

      // Generate Gaussian random number using Box-Muller transform
      rand = Math.random();
      num = Math.cos(2 * Math.PI * Math.random()) * Math.sqrt(-2 * Math.log(rand));
      num = num * sideStdDev + median;

      // Clamp the number to the min and max range
      num = Math.max(median + minRange, Math.min(median + maxRange, num));

      numbers.push(num);
    }

    return numbers;
  }

  /*   
  const median = 3;       // Center of the distribution
  const minRange = -2;    // Min value is 20
  const maxRange = 5;     // Max value is 80
  const count = 143;     // Number of values to generate
  const numbers = this.mathService.generateAsymmetricGaussianIntegers(count, median, minRange, maxRange);
  const histogramData = this.createIntegerHistogram(numbers,);
  this.displayHistogram(histogramData);
  */
  generateAsymmetricGaussianIntegers(count: number, median: number, minRange: number, maxRange: number): number[] {
    const numbers = this.generateAsymmetricGaussianNumbers(count, median, minRange, maxRange);
    numbers.forEach((value, index) => {
      numbers[index] = Math.floor(value);
    });
    return numbers;
  }

  generateWeightedGaussianNumbers(count: number, median: number, minRange: number, maxRange: number, skewness: number): number[] {
    const numbers = [];

    for (let i = 0; i < count; i++) {
      // Box-Muller transform for standard normal variable
      let u = Math.random();
      let v = Math.random();
      let standardNormal = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

      // Skewing the distribution
      standardNormal = Math.pow(standardNormal, skewness);

      // Scaling the standard normal variable to the asymmetric range
      let range = maxRange - minRange;
      let scaledNormal = standardNormal * range / 6 + median;

      // Ensuring the number falls within the specified range
      scaledNormal = Math.max(median + minRange, Math.min(median + maxRange, scaledNormal));

      numbers.push(scaledNormal);
    }

    return numbers;
  }

  generateTriangularNumbers(count: number, median: number, minRange: number, maxRange: number): number[] {
    const numbers = [];

    for (let i = 0; i < count; i++) {
      const rand = Math.random();
      let value;

      // Determine in which half of the distribution this number falls
      if (rand < 0.5) {
        // Lower half, from minRange to median
        value = median + (Math.sqrt(rand) - 1) * (median - (median + minRange));
      } else {
        // Upper half, from median to maxRange
        value = median + (1 - Math.sqrt(1 - rand)) * ((median + maxRange) - median);
      }

      numbers.push(value);
    }

    return numbers;
  }

  generateInverseBellCurveNumbers(count: number, median: number, minRange: number, maxRange: number): number[] {
    const numbers = [];

    // Define the slopes for each side of the median
    const slopeAscend = (median - minRange) / 0.5;
    const slopeDescend = (maxRange - median) / 0.5;

    for (let i = 0; i < count; i++) {
      const rand = Math.random();
      let value;

      if (rand < 0.5) {
        // Ascending part of the bell curve
        value = median - Math.sqrt(2 * rand * (median - minRange) * slopeAscend);
      } else {
        // Descending part of the bell curve
        value = median + Math.sqrt(2 * (1 - rand) * (maxRange - median) * slopeDescend);
      }

      numbers.push(value);
    }

    return numbers;
  }

  generateOutsideBellCurveNumbers(count: number, median: number, minRange: number, maxRange: number): number[] {
    const numbers = [];
    const min = median + minRange;
    const max = median + maxRange;

    for (let i = 0; i < count; i++) {
      const u1 = Math.random();
      const u2 = Math.random();
      let rand = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2); // Box-Muller transform
      rand = rand / 10.0 + 0.5; // Normalize to 0-1 and center at 0.5
      if (rand > 1 || rand < 0) continue; // Reject outliers

      // Piecewise function
      let value = 0;
      if (rand < 0.5) {
        value = 2 * rand;
        value = min + (median - min) * value * value;
      } else {
        value = 2 * (rand - 0.5);
        value = max - (max - median) * value * value;
      }

      numbers.push(value);
    }

    return numbers;
  }

  getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }



  generateLinearBellCurveNumbers(count: number, median: number, minRange: number, maxRange: number): number[] {
    const numbers = [];
    const min = median + minRange; // Actual min value
    const max = median + maxRange; // Actual max value
    const rangeLeft = median - min;
    const rangeRight = max - median;

    for (let i = 0; i < count; i++) {
      const u = Math.random(); // Uniform random number
      let value;

      if (u < 0.5) {
        // Left side of the median
        value = median - rangeLeft * Math.sqrt(2 * u);
      } else {
        // Right side of the median
        value = median + rangeRight * Math.sqrt(2 * (u - 0.5));
      }

      numbers.push(value);
    }

    return numbers;
  }




  createHistogram(data: number[], binCount: number): HistogramBin[] {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const binWidth = (max - min) / binCount;
    const histogram: HistogramBin[] = [];

    // Initialize bins
    for (let i = 0; i < binCount; i++) {
      histogram.push({
        range: `${(min + i * binWidth).toFixed(2)} to ${(min + (i + 1) * binWidth).toFixed(2)}`,
        count: 0
      });
    }

    // Assign numbers to bins
    data.forEach(value => {
      const binIndex = Math.min(Math.floor((value - min) / binWidth), binCount - 1);
      histogram[binIndex].count++;
    });

    return histogram;
  }

  createIntegerHistogram(data: number[]): HistogramIntBin[] {
    const min = Math.floor(Math.min(...data));
    const max = Math.ceil(Math.max(...data));
    const binCount = max - min + 1;
    const histogram: HistogramIntBin[] = [];

    // Initialize bins
    for (let i = 0; i < binCount; i++) {
      histogram.push({
        range: (min + i),
        count: 0
      });
    }

    // Assign numbers to bins
    data.forEach(value => {
      const binIndex = Math.floor(value) - min;
      histogram[binIndex].count++;
    });

    return histogram;
  }

  displayHistogram(histogram: HistogramBin[]): void {
    const maxCount = Math.max(...histogram.map(bin => bin.count));
    const maxWidth = 30; // Maximum width of a histogram bar

    console.log("Histogram Display:");
    histogram.forEach(bin => {
      const normalizedWidth = Math.floor((bin.count / maxCount) * maxWidth);
      const bar = '▇'.repeat(normalizedWidth);
      console.log(`${bin.range.toString().padEnd(3)} | ${bin.count.toString().padStart(4)} | ${bar}`);
    });
  }

}
